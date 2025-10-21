import OpenAI from "openai"

// Singleton OpenAI client instance
let openaiClient: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY
    
    if (!apiKey) {
      throw new Error("OpenAI API key is missing")
    }

    if (!apiKey.startsWith("sk-")) {
      throw new Error("OpenAI API key is invalid")
    }

    openaiClient = new OpenAI({
      apiKey: apiKey,
    })

  }

  return openaiClient
}
