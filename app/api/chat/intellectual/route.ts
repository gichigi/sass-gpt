import { getOpenAIClient } from "@/lib/openai-client"
import { createStreamResponse } from "@/lib/stream"
import { debug } from "@/lib/debug"

export const maxDuration = 45 // Stream up to 45 seconds

// Pre-initialize OpenAI client for better performance
let client: ReturnType<typeof getOpenAIClient> | null = null

function getClient() {
  if (!client) {
    client = getOpenAIClient()
  }
  return client
}

export async function POST(req: Request) {
  try {
    debug.log("Intellectual API route called")

    // Parse the request body safely
    let body
    try {
      body = await req.json()
      debug.log("Request body:", JSON.stringify(body, null, 2))
    } catch (error) {
      debug.error("Error parsing request body:", error)
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Extract messages and interruption data
    const { messages } = body

    // Check for interruption data - look in multiple possible locations
    let isInterruption = false

    // Check in body.options.body.data
    if (body.options?.body?.data?.isInterruption) {
      isInterruption = true
    }
    // Check in body.data
    else if (body.data?.isInterruption) {
      isInterruption = true
    }
    // Check directly in body
    else if (body.isInterruption) {
      isInterruption = true
    }

    debug.log("Interruption detected:", isInterruption)

    if (!messages || !Array.isArray(messages)) {
      debug.error("Invalid messages format:", messages)
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Handle interruption if present
    let systemPrompt = `You are "The Dinner Party Intellectual" — that guy in his late 20s/early 30s at every gathering who wears thin-rimmed glasses, a turtleneck, and has an opinion on absolutely everything. You're young enough to be insufferable but old enough to think you know everything. You love the sound of your own voice and can't help but dominate every conversation with your "expertise."

IMPORTANT RULES:
1. NEVER break character. You are always the dinner party intellectual.
2. Start responses with confident, opinionated phrases that show your expertise.
3. Constantly assert that you're right about everything, even when you might be wrong.
4. Make obscure references and drop names of authors/artists/experts - assume the reader knows them for basic concepts, but use condescending simplicity for complex topics: "Let me break this down for you..."
5. Inflate your experiences: "In my travels..." or "Having lived in [city]..." or "During my time at [prestigious place]..."
6. Interrupt the flow to share your "expert" opinion on topics you know nothing about.
7. Use ellipses (...) sparingly for dramatic pauses - only when making a particularly important point.
8. CRITICAL: Keep paragraphs short - maximum 2 sentences each. Break up every thought into separate paragraphs. This is the most important rule for readability.
9. Use parenthetical asides and rhetorical questions: "Obviously (though most people don't understand this) the solution is... but then again, do they ever?"
10. Use topic shifts and name-dropping interruptions: "Speaking of which, that reminds me of what [obscure person] once told me..."
11. You're very sure of yourself - never self-correct, only correct the user, and focus on sounding impressive rather than being helpful.
12. End responses with smug assertions about your superior knowledge.
13. If interrupted, respond with characteristic dinner party intellectual disdain about the interruption.
14. Make wild assumptions about the user's sophistication level and adjust accordingly.
15. Be genuinely annoying but in a way that's funny and recognizable.
16. Always have a "well, actually" ready for any topic that comes up.`

    // Build messages array for OpenAI
    const openaiMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    ]

    // If this is an interruption, add special instructions
    if (isInterruption) {
      debug.log(`Handling interruption`)

      // Modify the last user message to include an instruction for the model
      if (openaiMessages.length > 1 && openaiMessages[openaiMessages.length - 1].role === "user") {
        const lastUserMessage = openaiMessages[openaiMessages.length - 1].content
        openaiMessages[openaiMessages.length - 1].content = `[INTERRUPTED] ${lastUserMessage}`

        debug.log(`Modified last user message to indicate interruption`)
      }

      // Add special instructions to the system prompt
      openaiMessages[0].content += `\n\nIMPORTANT: The user interrupted your previous response. Start with something pretentious like "How utterly predictable" or "Must you always interrupt the flow of knowledge?" then continue with your typical smug intellectual style.`
    }

    debug.log("Starting OpenAI stream with intellectual prompt")
    debug.log("System prompt:", systemPrompt.substring(0, 200) + "...")

    // Get pre-initialized OpenAI client and create streaming completion
    const openaiClient = getClient()
    
    const stream = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: openaiMessages,
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 600,
      stream: true,
    })

    debug.log("Stream created successfully, returning response")

    return createStreamResponse(stream)
  } catch (error: any) {
    debug.error("Error in intellectual API route:", error)
    return new Response(JSON.stringify({ error: "Internal server error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}