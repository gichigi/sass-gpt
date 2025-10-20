import { debug } from "./debug"

/**
 * Converts an OpenAI chat completion stream into a ReadableStream of text chunks
 * that can be consumed by the client for progressive rendering.
 */
export function createStreamResponse(openaiStream: AsyncIterable<any>): Response {
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of openaiStream) {
          // Extract text content from OpenAI delta
          const content = chunk.choices?.[0]?.delta?.content
          
          if (content) {
            // Encode the text chunk and enqueue it
            const encoder = new TextEncoder()
            controller.enqueue(encoder.encode(content))
          }
          
          // Check if the stream is done
          if (chunk.choices?.[0]?.finish_reason) {
            debug.log("OpenAI stream finished:", chunk.choices[0].finish_reason)
            break
          }
        }
      } catch (error) {
        debug.error("Error in OpenAI stream:", error)
        controller.error(error)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  })
}
