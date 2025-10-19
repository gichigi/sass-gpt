import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { debug } from "@/lib/debug"
import { checkOpenAIApiKey } from "@/lib/check-api-key"
import { createSystemPrompt } from "@/lib/brand-voice"

export const maxDuration = 30 // Stream up to 30 seconds

export async function POST(req: Request) {
  try {
    debug.log("Exec API route called")

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

    // Create system prompt using brand voice
    let systemPrompt = createSystemPrompt('exec', isInterruption)

    // If this is an interruption, modify the last user message
    if (isInterruption) {
      debug.log(`Handling interruption`)

      // Modify the last user message to include an instruction for the model
      if (messages.length > 0 && messages[messages.length - 1].role === "user") {
        const lastUserMessage = messages[messages.length - 1].content
        messages[messages.length - 1].content = `[INTERRUPTED] ${lastUserMessage}`

        debug.log(`Modified last user message to indicate interruption`)
      }
    }

    debug.log("Starting OpenAI stream with exec prompt")
    debug.log("System prompt:", systemPrompt.substring(0, 200) + "...")

    const result = streamText({
      model: openai("gpt-4o"),
      messages,
      temperature: 0.9, // Business-speak variation
      topP: 0.92,
      maxTokens: 4096,
      system: systemPrompt,
    })

    debug.log("Stream created successfully, returning response")

    return result.toDataStreamResponse()
  } catch (error) {
    debug.error("Error in exec API route:", error)
    return new Response(JSON.stringify({ error: "Internal server error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
