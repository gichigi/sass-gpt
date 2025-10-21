"use client"

import type React from "react"

import { useSimpleChat } from "@/hooks/use-simple-chat"
import { useState, useRef, useEffect, useCallback } from "react"
import {
  ThumbsUp,
  ThumbsDown,
  Copy,
  Share2,
  MoreHorizontal,
  Plus,
  Send,
  ChevronDown,
  Check,
  ChevronLeft,
} from "lucide-react"
import { TypewriterEffect } from "@/components/typewriter-effect"
import { ChatSuggestions } from "@/components/chat-suggestions"
import { debug } from "@/lib/debug"

// Define our models
const models = [
  {
    id: "teenager",
    name: "The Teenager",
    description: "Knows everything, hates everyone.",
    enabled: true,
  },
  {
    id: "grandma",
    name: "The Grandma",
    description: "Sweet, insulting, judges your life choices",
    enabled: true,
    badge: "",
  },
  {
    id: "intellectual",
    name: "The Intellectual",
    description: "Brutally honest and weirdly specific",
    enabled: true,
  },
  {
    id: "exec",
    name: "The Exec",
    description: "Buzzwords and backhanded compliments",
    enabled: true,
  },
]


export default function ChatPage() {
  // Initialize selectedModel - always start with first model to avoid hydration mismatch
  const [selectedModel, setSelectedModel] = useState(models[0])
  const [isHydrated, setIsHydrated] = useState(false)
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const selectedModelRef = useRef(selectedModel)


  // Enhanced console logging for debugging
  const logDebug = (info: string, data?: any) => {
    const timestamp = new Date().toISOString()
    if (data) {
      debug.log(`[${timestamp}] ${info}`, data)
    } else {
      debug.log(`[${timestamp}] ${info}`)
    }
  }

  // Function to copy message content to clipboard
  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      logDebug(`Copied message ${messageId} to clipboard`)

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedMessageId(null)
      }, 2000)
    } catch (err) {
      logDebug(`Failed to copy message ${messageId} to clipboard: ${err}`)
    }
  }

  const {
    messages: chatMessages,
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
  } = useSimpleChat({
    api: `/api/chat`,
    voice: () => selectedModelRef.current.id,
    onActiveMessageChange: (messageId) => {
      setActiveMessageId(messageId)
    },
    onFinish: (message) => {
      setActiveMessageId(null)
    },
    onResponse: (response) => {
      logDebug(`onResponse called with status: ${response.status}`)
      // When a new response starts, set it as the active message
      const lastMessage = chatMessages[chatMessages.length - 1]
      if (lastMessage && lastMessage.role === "assistant") {
        logDebug(`Setting active message ID to: ${lastMessage.id}`)
        setActiveMessageId(lastMessage.id)
      }
    },
    onError: (err) => {
      logDebug(`Error in chat: ${err.message}`)
      console.error("Chat error:", err)
    },
  })

  // Update ref whenever selectedModel changes
  useEffect(() => {
    selectedModelRef.current = selectedModel
  }, [selectedModel])

  // Load saved model from localStorage after hydration to avoid hydration mismatch
  useEffect(() => {
    setIsHydrated(true)
    const savedModelId = localStorage.getItem('selectedModel')
    if (savedModelId) {
      const savedModel = models.find(model => model.id === savedModelId && model.enabled)
      if (savedModel) {
        setSelectedModel(savedModel)
      }
    }
  }, [])

  // Reset typing state when chat context changes (model switch, new messages, component mount)
  useEffect(() => {
    setIsTyping(false)
  }, [chatMessages.length, selectedModel.id])



  // Log messages for debugging (only on significant changes)
  useEffect(() => {
    // Only log when message count changes, not on every content update
    if (chatMessages.length !== prevMessagesLength.current) {
      logDebug(`Messages updated, count: ${chatMessages.length}`)
      if (chatMessages.length > 0) {
        const lastMsg = chatMessages[chatMessages.length - 1]
        logDebug(`Last message: role=${lastMsg.role}, id=${lastMsg.id}, content=${lastMsg.content.substring(0, 50)}...`)
      }
      prevMessagesLength.current = chatMessages.length
    }
  }, [chatMessages.length]) // Only depend on length, not full array

  // Log loading state changes
  useEffect(() => {
    logDebug(`Loading state changed: ${isLoading}`)
  }, [isLoading])

  // Log errors
  useEffect(() => {
    if (error) {
      logDebug(`Error occurred: ${error.message}`)
    }
  }, [error])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const modelSelectorRef = useRef<HTMLDivElement>(null)
  const prevMessagesLength = useRef(chatMessages.length)
  const [isInputFocused, setIsInputFocused] = useState(false)
  
  // Smart auto-scroll state
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const scrollThreshold = 100 // pixels from bottom
  
  // Add a simple auto-scroll during typing
  useEffect(() => {
    if (isTyping && shouldAutoScroll) {
      const interval = setInterval(() => {
        scrollToBottom("auto")
      }, 100) // Scroll every 100ms during typing
      
      return () => clearInterval(interval)
    }
  }, [isTyping, shouldAutoScroll])

  // Handle suggestion selection - directly append message
  const handleSuggestionSelect = (suggestion: string) => {
    logDebug(`Suggestion selected: ${suggestion}`)
    // Force scroll to bottom when user selects a suggestion
    setShouldAutoScroll(true)
    // Directly append the user message
    append({
      role: "user",
      content: suggestion,
    })
  }

  // Handle form submission - simplified
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoading && !isTyping) {
      // Force scroll to bottom when user sends a message
      setShouldAutoScroll(true)
      handleSubmit(e)
    }
  }

  // Close model selector when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(event.target as Node)) {
        setShowModelSelector(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Check if user is near the bottom of the chat
  const checkIfNearBottom = useCallback(() => {
    if (!chatContainerRef.current) return true // Default to true if container not ready
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight
    const isNearBottom = distanceFromBottom < scrollThreshold
    logDebug(`Distance from bottom: ${distanceFromBottom}, threshold: ${scrollThreshold}, nearBottom: ${isNearBottom}`)
    return isNearBottom
  }, [scrollThreshold])

  // Improved scroll handling
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: "end" })
    }
  }

  // Handle scroll events to track user position
  const handleScroll = useCallback(() => {
    const isNearBottom = checkIfNearBottom()
    setShouldAutoScroll(isNearBottom)
    
    // Debug scroll info
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
      logDebug(`Scroll: top=${scrollTop}, height=${scrollHeight}, client=${clientHeight}, nearBottom=${isNearBottom}`)
    }
  }, [checkIfNearBottom])

  // Add scroll event listener
  useEffect(() => {
    const chatContainer = chatContainerRef.current
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll, { passive: true })
      return () => chatContainer.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // Debug container dimensions when messages change and force scroll for new messages
  useEffect(() => {
    if (chatContainerRef.current && chatMessages.length > 0) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
      logDebug(`Container dimensions: scrollHeight=${scrollHeight}, clientHeight=${clientHeight}, scrollable=${scrollHeight > clientHeight}`)
      
      // Force scroll to bottom when new messages are added
      if (chatMessages.length > prevMessagesLength.current) {
        logDebug(`New message added, forcing scroll to bottom`)
        setTimeout(() => {
          scrollToBottom("smooth")
        }, 100)
      }
    }
  }, [chatMessages.length])

  // Scroll to bottom when messages change or when typing
  useEffect(() => {
    if (chatMessages.length > 0 && showWelcome) {
      logDebug("First message received, hiding welcome screen")
      setIsTransitioning(true)
      // Add a small delay for smooth transition
      setTimeout(() => {
        setShowWelcome(false)
        setIsTransitioning(false)
      }, 150)
    }

    // Always auto-scroll on new messages, but respect user scroll position
    if (chatMessages.length > 0) {
      // Use a small timeout to ensure DOM updates are complete
      const timer = setTimeout(() => {
        if (shouldAutoScroll) {
          scrollToBottom()
        }
      }, 50) // Slightly longer timeout for better reliability
      return () => clearTimeout(timer)
    }

    // Focus input after new message is received
    if (chatMessages.length > prevMessagesLength.current) {
      inputRef.current?.focus()
    }
    prevMessagesLength.current = chatMessages.length
  }, [chatMessages, showWelcome, isInputFocused, shouldAutoScroll])

  // Focus input on initial load
  useEffect(() => {
    // Short timeout to ensure DOM is ready
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user presses / when not focused on input, focus the input
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Handle viewport changes on mobile
  useEffect(() => {
    const handleResize = () => {
      // When the virtual keyboard appears on mobile, we want to scroll to the bottom
      // but only if user is near bottom or it's a new message
      if (isInputFocused && shouldAutoScroll) {
        scrollToBottom("auto")
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isInputFocused, shouldAutoScroll])

  // Handle visibility changes (e.g., when user switches tabs/apps and comes back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !showWelcome && shouldAutoScroll) {
        scrollToBottom("auto")
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [showWelcome, shouldAutoScroll])

  // Prevent zoom on input focus
  useEffect(() => {
    // This helps prevent the zoom issue on iOS Safari
    const preventZoom = (e: TouchEvent) => {
      // Only prevent zoom gestures (pinch), not regular scrolling
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }

    document.addEventListener("touchmove", preventZoom, { passive: false })
    return () => {
      document.removeEventListener("touchmove", preventZoom)
    }
  }, [])

  // Add this function to handle model switching
  const handleModelChange = (model: (typeof models)[0]) => {
    if (model.enabled) {
      setSelectedModel(model)
      setMessages([]) // Clear messages when switching models
      setIsTransitioning(true)
      setShowWelcome(true)
      setShowModelSelector(false)
      setShouldAutoScroll(true) // Reset auto-scroll for new conversation
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedModel', model.id)
      }
      
      // Complete transition and focus input
      setTimeout(() => {
        setIsTransitioning(false)
        inputRef.current?.focus()
      }, 150)
    }
  }

  // Force a retry of the last message
  const handleRetry = () => {
    logDebug("Manually retrying last message")
    reload()
  }

  // Cleanup typing state on component unmount
  useEffect(() => {
    return () => {
      setIsTyping(false)
    }
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-white w-full">
      {/* Header - fixed height */}
      <header className="border-b border-gray-200 py-3 px-4 flex items-center shrink-0">
        <button 
          onClick={() => {
            stop() // Stop any ongoing stream
            setMessages([]) // Clear chat history
            setIsTransitioning(true)
            setShowWelcome(true) // Show welcome screen
            setIsTyping(false) // Reset typing state
            setShouldAutoScroll(true) // Reset auto-scroll for new conversation
            setTimeout(() => setIsTransitioning(false), 150)
          }}
          className="flex items-center hover:bg-gray-100 rounded-md px-2 py-1 transition-colors"
        >
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PYW7C7zMZvkQ9hPVaBVfq4nruDds2V.png"
            alt="ChatGPT Logo"
            className="w-5 h-5"
          />
          <span className="font-semibold ml-2 text-sm">ChatGPT</span>
        </button>

        <div className="relative ml-3" ref={modelSelectorRef}>
          <button
            onClick={() => setShowModelSelector(!showModelSelector)}
            className="flex items-center text-sm text-gray-700 hover:bg-gray-100 rounded-md px-2 py-1"
          >
            {selectedModel.name}
            <ChevronDown size={14} className="ml-1 text-gray-500" />
          </button>

          {showModelSelector && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="flex items-center p-3 border-b border-gray-100">
                <button onClick={() => setShowModelSelector(false)} className="p-1 mr-2 hover:bg-gray-100 rounded">
                  <ChevronLeft size={14} />
                </button>
                <div className="font-medium text-sm">Choose a model</div>
              </div>

              <div className="py-1">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelChange(model)}
                    className={`w-full flex items-center px-3 py-2 hover:bg-gray-50 ${
                      !model.enabled ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="flex-1 text-left">
                      <div className="flex items-center">
                        <div className="font-medium text-sm">{model.name}</div>
                        {model.badge && (
                          <span className="ml-2 text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 text-[10px]">
                            {model.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{model.description}</div>
                    </div>
                    {model.id === selectedModel.id && (
                      <div className="ml-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="h-7 w-7 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-medium text-xs">
            U
          </div>
        </div>
      </header>

      {/* Main content area - flexible height */}
      <div className="flex-1 flex flex-col">
        {showWelcome ? (
          <div className={`h-full flex flex-col overflow-auto transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PYW7C7zMZvkQ9hPVaBVfq4nruDds2V.png"
                alt="ChatGPT Logo"
                className="w-10 h-10 mb-3"
              />
              <h1 className="text-2xl font-semibold text-gray-800 mb-6">What do you want?</h1>

              <ChatSuggestions onSelectSuggestion={handleSuggestionSelect} />
            </div>

            <div className="p-3 w-full max-w-2xl mx-auto mt-auto">
              <form
                onSubmit={handleFormSubmit}
                className="relative flex items-center bg-white border border-gray-300 rounded-[20px] shadow-sm"
              >
                <button type="button" className="p-2 text-gray-500">
                  <Plus size={16} />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder="Go on then..."
                  className="flex-1 py-2 px-1 bg-transparent outline-none text-[16px]"
                  autoFocus
                />
                <div className="flex items-center px-2">
                  <button type="submit" className="p-1 text-gray-500 hover:bg-gray-100 rounded-full">
                    <Send size={16} />
                  </button>
                </div>
              </form>
              <div className="text-[10px] text-center text-gray-500 mt-1.5">
                ChatGPT can be rude. Don't take it personally.
              </div>
            </div>
          </div>
        ) : (
          <div className={`transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            {/* Chat messages - scrollable */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-3 pb-0 w-full"
              style={{ overscrollBehavior: "auto" }}
            >
              <div className="max-w-2xl mx-auto">
                {chatMessages.map((message, index) => (
                  <div key={index} className={`mb-4 ${message.role === "user" ? "text-right" : ""}`}>
                    {message.role === "user" ? (
                      <div className="inline-block max-w-[80%] bg-gray-100 rounded-[1rem] px-3 py-2 text-left text-sm">
                        {message.content}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-start">
                          <div className="mr-2 mt-1 flex-shrink-0">
                            <img
                              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PYW7C7zMZvkQ9hPVaBVfq4nruDds2V.png"
                              alt="ChatGPT Logo"
                              className="w-5 h-5"
                            />
                          </div>
                          <div className="inline-block max-w-[calc(100%-2rem)] text-left text-sm">
                            <TypewriterEffect
                              content={message.content}
                              character={selectedModel.id as "teenager" | "grandma" | "intellectual" | "exec"}
                              messageId={message.id}
                              onTypingChange={setIsTyping}
                              key={message.id}
                            />


                            {/* Show error if there is one */}
                            {error && activeMessageId === message.id && (
                              <div className="text-red-500 text-xs mt-1">
                                Error: {error.message}
                                <button onClick={handleRetry} className="ml-2 underline hover:text-red-700">
                                  Retry
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1.5 text-gray-500 ml-7">
                          <button
                            className="p-1 hover:bg-gray-100 rounded-full"
                            onClick={() => copyToClipboard(message.content, message.id)}
                            aria-label="Copy to clipboard"
                          >
                            {copiedMessageId === message.id ? (
                              <Check size={14} className="text-green-500" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded-full">
                            <ThumbsUp size={14} />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded-full">
                            <ThumbsDown size={14} />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded-full">
                            <Share2 size={14} />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded-full">
                            <MoreHorizontal size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {/* This empty div is used as a scroll target */}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            </div>

            {/* Input area - fixed at bottom */}
            <div className="p-3 border-t border-gray-200 shrink-0 w-full">
              <div className="max-w-2xl mx-auto">
                <form
                  onSubmit={handleFormSubmit}
                  className="relative flex items-center bg-white border border-gray-300 rounded-[20px] shadow-sm"
                >
                  <button type="button" className="p-2 text-gray-500">
                    <Plus size={16} />
                  </button>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    placeholder="Go on then..."
                    className="flex-1 py-2 px-1 bg-transparent outline-none text-[16px]"
                  />
                  <div className="flex items-center px-2">
                    <button
                      type="submit"
                      className={`p-1 rounded-full ${
                        (isLoading || isTyping)
                          ? "text-gray-300 cursor-not-allowed" 
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                      disabled={isLoading || isTyping}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </form>
                <div className="text-[10px] text-center text-gray-500 mt-1.5">
                  ChatGPT can be rude. Don't take it personally.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
