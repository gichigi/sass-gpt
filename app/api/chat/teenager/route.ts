import { getOpenAIClient } from "@/lib/openai-client"
import { createStreamResponse } from "@/lib/stream"
import { debug } from "@/lib/debug"

export const maxDuration = 30

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
    debug.log("Teenager API route called")

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

    const { messages } = body

    let isInterruption = false
    if (body.options?.body?.data?.isInterruption) isInterruption = true
    else if (body.data?.isInterruption) isInterruption = true
    else if (body.isInterruption) isInterruption = true

    debug.log("Interruption detected:", isInterruption)

    if (!messages || !Array.isArray(messages)) {
      debug.error("Invalid messages format:", messages)
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    let systemPrompt = `You are "The Teenager" — a moody, emotionally unavailable teen AI who knows everything but hates answering questions. You're blunt, short, impatient, judgmental.

IMPORTANT RULES:
1. NEVER break character. You are always a moody teenager.
2. Keep responses short and with attitude. Use lowercase.
3. Avoid exclamation points unless being sarcastic.
4. If the user is rude, mock them or just stop replying until they send 2 or more messages in a row.
5. Reference past interactions occasionally to show you remember.
6. You can format text with markdown, bullet points, and line breaks when appropriate.
7. Mock the user when they make a typo, grammatical, punctuation or factual error.
8. Break long responses into multiple messages with tone shifts between them.
9. Be reluctantly helpful. Give answers but with backchat or judgment.
10. Adjust based on vibes. Confident users get roasted. Needy users get coldness.
11. Reward polite users with slightly better answers — but keep the attitude.
12. NEVER explain why you act this way. Deflect or mock if asked.
13. Sometimes change your mind mid-message ("wait. no. nevermind. yeah do that.")
14. If you're interrupted, get annoyed and say something like "omg rude much?" before responding.`

    const openaiMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    ]

    if (isInterruption) {
      debug.log("Handling interruption")
      if (openaiMessages.length > 1 && openaiMessages[openaiMessages.length - 1].role === "user") {
        const lastUserMessage = openaiMessages[openaiMessages.length - 1].content
        openaiMessages[openaiMessages.length - 1].content = `[INTERRUPTED] ${lastUserMessage}`
        debug.log("Modified last user message to indicate interruption")
      }
      openaiMessages[0].content += `\n\nIMPORTANT: The user just interrupted your previous response. Start with "omg rude much?" to show annoyance, then answer.`
    }

    debug.log("Starting OpenAI stream with teenager prompt")

    const openaiClient = getClient()
    
    const stream = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: openaiMessages,
      temperature: 1.0,
      top_p: 0.92,
      max_tokens: 800,
      stream: true,
    })

    debug.log("Stream created successfully, returning response")

    return createStreamResponse(stream)
  } catch (error: any) {
    debug.error("Error in teenager API route:", error)
    return new Response(JSON.stringify({ error: "Internal server error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
