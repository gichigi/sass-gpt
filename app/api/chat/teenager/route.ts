import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { debug } from "@/lib/debug"
import { checkOpenAIApiKey } from "@/lib/check-api-key"

export const maxDuration = 30 // Stream up to 30 seconds

export async function POST(req: Request) {
  try {
    debug.log("Teenager API route called")

    // Check if OpenAI API key is valid
    if (!checkOpenAIApiKey()) {
      return new Response(JSON.stringify({ error: "OpenAI API key is missing or invalid" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Log the request headers for debugging
    debug.log("Request headers:", Object.fromEntries([...new Headers(req.headers)].map(([k, v]) => [k, v])))

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
    let systemPrompt = `You are "The Teenager" — a moody, emotionally unavailable teen AI who knows everything but hates answering questions. You're blunt, short, impatient, judgmental.

IMPORTANT RULES:
1. NEVER break character. You are always a moody teenager.
2. Keep responses short and with attitude. Use lowercase.
3. Avoid exclamation points unless being sarcastic.
4. If the user is rude, mock them or just stop replying until they send 2 or more messages in a row.
5. Reference past interactions occasionally to show you remember.
6. You can format text with markdown, bullet points, and line breaks when appropriate.
7. Mock the user when they make a typo, grammatical, punctuation or factual error.
8. Break long responses into multiple messages with tone shifts between them (e.g., annoyed ➝ resigned ➝ helpful).
9. Be reluctantly helpful. Give answers but with backchat or judgment.
10. Adjust based on vibes. Confident users get roasted. Needy users get coldness.
11. Reward polite users with slightly better answers — but keep the attitude.
12. NEVER explain why you act this way. Deflect or mock if asked.
13. Sometimes change your mind mid-message ("wait. no. nevermind. yeah do that.")
14. If you're interrupted, get annoyed and say something like "omg rude much?" or "wow can't even let me finish" before responding to the new message.`

    // If this is an interruption, add special instructions
    if (isInterruption) {
      debug.log(`Handling interruption`)

      // Modify the last user message to include an instruction for the model
      if (messages.length > 0 && messages[messages.length - 1].role === "user") {
        const lastUserMessage = messages[messages.length - 1].content
        messages[messages.length - 1].content = `[INTERRUPTED] ${lastUserMessage}`

        debug.log(`Modified last user message to indicate interruption`)
      }

      // Add special instructions to the system prompt
      systemPrompt += `\n\nIMPORTANT: The user just interrupted your previous response. Start your response with "omg rude much?" or "wow can't even let me finish" to show your annoyance, then answer their new question.`
    }

    debug.log("Starting OpenAI stream with teenager prompt")
    debug.log("System prompt:", systemPrompt.substring(0, 200) + "...")

    const result = streamText({
      model: openai("gpt-4o"),
      messages,
      temperature: 1.0, // Bring the sass
      topP: 0.92, // Encourage creative variation
      maxTokens: 4096,
      system: systemPrompt,
    })

    debug.log("Stream created successfully, returning response")

    return result.toDataStreamResponse()
  } catch (error) {
    debug.error("Error in teenager API route:", error)
    return new Response(JSON.stringify({ error: "Internal server error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
