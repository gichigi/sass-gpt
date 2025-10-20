import { useState, useCallback, useRef } from "react"

export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
}

export interface UseSimpleChatOptions {
  api: string
  voice?: string
  onFinish?: (message: Message) => void
  onResponse?: (response: Response) => void
  onError?: (error: Error) => void
  onActiveMessageChange?: (messageId: string | null) => void
}

export interface UseSimpleChatReturn {
  messages: Message[]
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  error: Error | null
  setInput: (input: string) => void
  append: (message: { role: "user" | "assistant"; content: string }, options?: any) => Promise<void>
  reload: () => void
  stop: () => void
  setMessages: (messages: Message[] | ((messages: Message[]) => Message[])) => void
}

export function useSimpleChat(options: UseSimpleChatOptions): UseSimpleChatReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const generateId = () => Math.random().toString(36).substring(2, 15)

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }, [])

  const processStream = async (response: Response, assistantMessage: Message) => {
    if (!response.body) {
      throw new Error("No response body")
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let accumulatedContent = ""
    let lastUpdateTime = 0
    const UPDATE_INTERVAL = 50 // Update every 50ms for smooth streaming

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        accumulatedContent += chunk
        
        // Smart batching: only update UI at regular intervals
        const now = Date.now()
        if (now - lastUpdateTime >= UPDATE_INTERVAL) {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content: accumulatedContent }
                : msg
            )
          )
          lastUpdateTime = now
        }
      }

      // Final update to ensure all content is displayed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, content: accumulatedContent }
            : msg
        )
      )

      // Call onFinish when streaming is complete
      const finalMessage = { ...assistantMessage, content: accumulatedContent }
      if (options.onFinish) {
        options.onFinish(finalMessage)
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        throw err
      }
    } finally {
      reader.releaseLock()
    }
  }

  const sendMessage = async (userMessage: Message, requestOptions?: any) => {
    setIsLoading(true)
    setError(null)

    // Create abort controller for this request
    abortControllerRef.current = new AbortController()

    try {
      // Add user message to state
      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)

      // Create assistant message placeholder
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "",
      }

      // Add assistant message to state
      setMessages(prev => [...prev, assistantMessage])

      // Notify parent component about active message
      if (options.onActiveMessageChange) {
        options.onActiveMessageChange(assistantMessage.id)
      }

      // Prepare request body
      const requestBody = {
        messages: updatedMessages,
        voice: options.voice,
        ...requestOptions,
      }

      // Make request to API
      const response = await fetch(options.api, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      })

      if (options.onResponse) {
        options.onResponse(response)
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.details || errorMessage
        } catch {
          const errorText = await response.text().catch(() => "")
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      // Process the streaming response
      await processStream(response, assistantMessage)
    } catch (err) {
      console.error("Error in sendMessage:", err)
      const error = err instanceof Error ? err : new Error("Unknown error")
      setError(error)
      
      if (options.onError) {
        options.onError(error)
      }

      // Remove the failed assistant message
      setMessages(prev => prev.filter(msg => msg.role !== "assistant" || msg.content !== ""))
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
      
      // Clear active message when done
      if (options.onActiveMessageChange) {
        options.onActiveMessageChange(null)
      }
    }
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input.trim(),
    }

    setInput("")
    await sendMessage(userMessage)
  }, [input, isLoading, messages, options.api])

  const append = useCallback(async (message: { role: "user" | "assistant"; content: string }, requestOptions?: any) => {
    const newMessage: Message = {
      id: generateId(),
      role: message.role,
      content: message.content,
    }

    if (message.role === "user") {
      await sendMessage(newMessage, requestOptions)
    } else {
      // For assistant messages, just add to state
      setMessages(prev => [...prev, newMessage])
    }
  }, [messages, options.api])

  const reload = useCallback(() => {
    // Find the last user message and resend it
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === "user")
    if (lastUserMessage) {
      // Remove any assistant messages after the last user message
      const userMessageIndex = messages.lastIndexOf(lastUserMessage)
      const messagesToKeep = messages.slice(0, userMessageIndex + 1)
      setMessages(messagesToKeep)
      
      // Resend the last user message
      sendMessage(lastUserMessage)
    }
  }, [messages])

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setInput,
    append,
    reload,
    stop,
    setMessages,
  }
}
