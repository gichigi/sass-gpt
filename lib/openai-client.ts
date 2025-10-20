import OpenAI from "openai"
import { debug } from "./debug"

// Singleton OpenAI client instance
let openaiClient: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY
    
    if (!apiKey) {
      debug.error("OPENAI_API_KEY is not set")
      throw new Error("OpenAI API key is missing")
    }

    if (!apiKey.startsWith("sk-")) {
      debug.error("OPENAI_API_KEY appears to be invalid (should start with 'sk-')")
      throw new Error("OpenAI API key is invalid")
    }

    openaiClient = new OpenAI({
      apiKey: apiKey,
    })

    debug.log("OpenAI client initialized")
  }

  return openaiClient
}
