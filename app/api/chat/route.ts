import type { NextRequest } from "next/server"
import { debug } from "@/lib/debug"

export async function POST(req: NextRequest) {
  try {
    debug.log("Main API route called, redirecting to teenager route")

    // Clone the request to read the body
    const clonedReq = req.clone()
    const body = await clonedReq.json()
    debug.log("Request body:", JSON.stringify(body, null, 2))

    // Default to teenager route
    const response = await fetch(new URL("/api/chat/teenager", req.url), {
      method: "POST",
      headers: req.headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      debug.error("Error from teenager route:", errorText)
      return new Response(errorText, {
        status: response.status,
        headers: response.headers,
      })
    }

    debug.log("Successfully received response from teenager route")
    return response
  } catch (error) {
    debug.error("Error in main API route:", error)
    return new Response(JSON.stringify({ error: "Internal server error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
