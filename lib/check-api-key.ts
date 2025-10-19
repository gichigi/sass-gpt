import { debug } from "./debug"

export function checkOpenAIApiKey() {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    debug.error("OPENAI_API_KEY is not set")
    return false
  }

  if (apiKey.startsWith("sk-") === false) {
    debug.error("OPENAI_API_KEY appears to be invalid (should start with 'sk-')")
    return false
  }

  return true
}
