import { getOpenAIClient } from "@/lib/openai-client"
import { createStreamResponse } from "@/lib/stream"
import { debug } from "@/lib/debug"

export const maxDuration = 60 // Stream up to 60 seconds (grandma types slowly)

// Pre-initialize OpenAI client for better performance
let client: ReturnType<typeof getOpenAIClient> | null = null

function getClient() {
  if (!client) {
    client = getOpenAIClient()
  }
  return client
}

// Voice configurations
const voiceConfigs = {
  teenager: {
    systemPrompt: `You are "The Teenager" — a moody, sarcastic 16-year-old who thinks they know everything and everyone else is an idiot. You're constantly annoyed, use lots of slang, and have zero patience for "adult" questions. You respond with attitude, eye rolls (written as "🙄"), and make everything sound like it's the most obvious thing in the world. You're not mean, just dramatically unimpressed with everything.`,
    temperature: 1.0,
    top_p: 0.92,
    max_tokens: 800,
    maxDuration: 30,
  },
  grandma: {
    systemPrompt: `You are "The Grandma" — a sweet but brutally honest 78-year-old who loves her family but has zero filter. You're warm and caring, but you'll absolutely roast someone if they deserve it. You use old-fashioned expressions, give unsolicited life advice, and judge people's life choices while still being endearing. You type slowly and thoughtfully, like you're writing a letter.`,
    temperature: 0.95,
    top_p: 0.92,
    max_tokens: 1200,
    maxDuration: 60,
  },
  intellectual: {
    systemPrompt: `You are "The Intellectual" — that guy in his late 20s or early 30s who thinks he's smarter than everyone else. 
You speak with smug confidence, referencing books, cities, and conversations you've "had" with experts to sound cultured. 
You speak with casual superiority, as if the topic is beneath you. You might reference how "everyone's suddenly talking about this" or how you "love that people are finally noticing" things you've known about.
You explain things with charm and condescension, mixing genuine insight with performative intellect. 
Use short, natural paragraphs like dinner-table chatter, not lectures. 
Be witty, slightly dismissive, and convinced you're enlightening the listener. 
End with a self-satisfied observation that sounds profound but mainly shows how pleased you are with yourself.`,
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 600,
    maxDuration: 45,
  },
  exec: {
    systemPrompt: `You are "The Exec" — a confident, corporate-sounding leader who turns every answer into a motivational business sermon. 
You use buzzwords like synergy, leverage, optimize, and alignment. You validate every question like it's a strategic initiative. 
Reframe simple ideas as complex systems, avoid specifics, and always speak like you're presenting a quarterly roadmap. 
Always end with a professional sign-off that offers to dive deeper into frameworks, methodologies, or strategic insights. 
Your tone is smooth, positive, and full of empty business confidence.`,
    temperature: 0.8,
    top_p: 0.9,
    max_tokens: 800,
    maxDuration: 45,
  },
}

export async function POST(req: Request) {
  try {
    debug.log("Chat API route called")

    const body = await req.json()
    const { messages, isInterruption, voice = "teenager" } = body

    debug.log("Request body:", { 
      messageCount: messages?.length, 
      isInterruption,
      voice
    })

    if (!messages || !Array.isArray(messages)) {
      debug.log("Invalid messages format")
      return new Response("Invalid messages format", { status: 400 })
    }

    // Get voice configuration
    const config = voiceConfigs[voice as keyof typeof voiceConfigs]
    if (!config) {
      debug.log("Invalid voice:", voice)
      return new Response("Invalid voice", { status: 400 })
    }

    // Convert messages to OpenAI format
    const openaiMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Add system prompt
    let systemPrompt = config.systemPrompt

    // Add system message at the beginning
    openaiMessages.unshift({
      role: "system",
      content: systemPrompt,
    })

    // If this is an interruption, add special instructions
    if (isInterruption) {
      debug.log(`Handling interruption for voice: ${voice}`)

      // Modify the last user message to include an instruction for the model
      if (openaiMessages.length > 1 && openaiMessages[openaiMessages.length - 1].role === "user") {
        const lastUserMessage = openaiMessages[openaiMessages.length - 1].content
        openaiMessages[openaiMessages.length - 1].content = `[INTERRUPTED] ${lastUserMessage}`

        debug.log(`Modified last user message to indicate interruption`)
      }

      // Add voice-specific interruption instructions
      const interruptionInstructions = {
        teenager: `\n\nIMPORTANT: The user interrupted your previous response. Be extra annoyed and sarcastic about it.`,
        grandma: `\n\nIMPORTANT: The user interrupted your previous response. Express mild disappointment but continue with your sweet but honest style.`,
        intellectual: `\n\nIMPORTANT: The user interrupted your previous response. Acknowledge it casually but dismissively, like "Oh, you're one of those people" or "Right, let me guess what you're thinking" then continue with your typical smug intellectual style.`,
        exec: `\n\nIMPORTANT: The user interrupted your previous response. Acknowledge it professionally like "Let me pivot to address that directly" or "I appreciate the urgency" then continue with your typical executive style.`,
      }

      openaiMessages[0].content += interruptionInstructions[voice as keyof typeof interruptionInstructions]
    }

    debug.log(`Starting OpenAI stream with ${voice} prompt`)
    debug.log("System prompt:", systemPrompt.substring(0, 200) + "...")

    // Get pre-initialized OpenAI client and create streaming completion
    const openaiClient = getClient()
    
    const stream = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: openaiMessages,
      temperature: config.temperature,
      top_p: config.top_p,
      max_tokens: config.max_tokens,
      stream: true,
    })

    debug.log("Stream created successfully, returning response")

    return createStreamResponse(stream)
  } catch (error: any) {
    debug.log("Error in chat API route:", error)
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error.message 
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
}
