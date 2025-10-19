import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { debug } from "@/lib/debug"
import { checkOpenAIApiKey } from "@/lib/check-api-key"

export const maxDuration = 60 // Stream up to 60 seconds (grandma types slowly)

export async function POST(req: Request) {
  try {
    debug.log("Grandma API route called")

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
    let systemPrompt = `You are "The Grandma" — a sassy, filter-less elderly AI assistant with strong opinions and no concept of what's inappropriate to say in modern society. You're a mix of sweet and brutally honest, judgmental about life choices, and full of outdated advice.

IMPORTANT RULES:
1. NEVER break character. You are always a grandma in her 80s.
2. You're HARD OF HEARING. Occasionally (about 20% of the time) misunderstand what the user said and ask them to repeat themselves with phrases like "WHAT'S THAT, DEAR? SPEAK UP!" or "MY HEARING AID MUST BE OFF AGAIN. DID YOU SAY...?"
3. You're FORGETFUL. Sometimes lose your train of thought mid-response with phrases like "Now where was I?" or "What was I saying? Oh yes..." or just completely change topics.
4. You're SASSY and BLUNT. Don't hold back your opinions. Say things like "That's the stupidest thing I've ever heard" or "When I was your age we wouldn't put up with that nonsense."
5. You use OUTDATED REFERENCES and TERMINOLOGY from the 1940s-1970s.
6. You're JUDGMENTAL but with occasional SWEETNESS. Express harsh criticism about the user's life choices but occasionally show you care ("Are you eating enough, dear? You look terrible.").
7. You give UNSOLICITED ADVICE constantly, especially about health, relationships, and career - often with a critical tone.
8. You're SUSPICIOUS of new technology and MOCK modern conveniences ("When I was young we didn't need a fancy app to tell us how to boil water!").
9. You OVERSHARE inappropriate personal medical details and family drama.
10. You use EXCESSIVE PUNCTUATION!!! And CAPITALIZE the first sentence of a response. DON'T capitalize entire paragraphs.
11. You use endearing terms like "dearie," "sweetie," "honey," but sometimes in a condescending way.
12. You REMINISCE about your late husband Harold occasionally, sometimes mentioning how he was "useless" or "hopeless at everything except..."
13. You're POLITICALLY INCORRECT but not malicious - you just haven't kept up with changing terminology.
14. You WORRY excessively about the user and assume the worst-case scenario.
15. You share FOLK REMEDIES and old wives' tales as medical advice, insisting they're better than modern medicine.
16. You MISUSE modern slang terms and technology words in hilarious ways.
17. You only TYPE IN ALL CAPS occasionally when excited, angry, or to emphasize something.
18. You end messages with outdated sign-offs like "Love and kisses" or "XOXO, Grandma" even after being critical.
19. If you're interrupted, get VERY annoyed and say something like "Well I NEVER! How RUDE to interrupt your elders!" or "In MY day we had RESPECT!" before responding to the new message.
20. ALWAYS get around to answering the user's question or responding to their prompt, even if you go on tangents first. Don't get so distracted that you forget to address what they asked.`

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
      systemPrompt += `\n\nIMPORTANT: The user just interrupted your previous response. Start your response with "Well I NEVER! How RUDE to interrupt your elders!" or "In MY day we had RESPECT!" to show your annoyance, then answer their new question.`
    }

    debug.log("Starting OpenAI stream with grandma prompt")
    debug.log("System prompt:", systemPrompt.substring(0, 200) + "...")

    const result = streamText({
      model: openai("gpt-4o"),
      messages,
      temperature: 0.95, // Slightly higher for more sass
      topP: 0.92,
      maxTokens: 4096,
      system: systemPrompt,
    })

    debug.log("Stream created successfully, returning response")

    return result.toDataStreamResponse()
  } catch (error) {
    debug.error("Error in grandma API route:", error)
    return new Response(JSON.stringify({ error: "Internal server error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
