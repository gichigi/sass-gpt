"use client"

import { useState, useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import { debug } from "@/lib/debug"

interface TypewriterEffectProps {
  content: string
  isComplete: boolean
  character?: "teenager" | "grandma" | "intellectual"
  messageId: string
  shouldRender: boolean // Add this to control whether to render the message
}

export function TypewriterEffect({
  content,
  isComplete,
  character = "teenager",
  messageId,
  shouldRender,
}: TypewriterEffectProps) {
  // Always initialize these state variables regardless of shouldRender
  const [displayedContent, setDisplayedContent] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const contentRef = useRef<string>(content)
  const lastContentLengthRef = useRef<number>(0)

  // Debug the current state
  useEffect(() => {
    debug.log(`TypewriterEffect for message ${messageId}:`, {
      contentLength: content.length,
      displayedContentLength: displayedContent.length,
      isComplete,
      shouldRender,
      isTyping,
    })
  }, [content, displayedContent, isComplete, shouldRender, isTyping, messageId])

  // Update contentRef when content changes
  useEffect(() => {
    contentRef.current = content
  }, [content])

  // Start typing immediately when content is available
  useEffect(() => {
    if (!shouldRender) return

    if (content) {
      // Start typing immediately without delay
      setIsTyping(true)
    }
  }, [content, shouldRender])

  // Reset state when message ID changes (new message)
  useEffect(() => {
    debug.log(`Message ID changed to ${messageId}, resetting state`)
    setDisplayedContent("")
    setIsTyping(false)
    lastContentLengthRef.current = 0

    // Clean up any existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [messageId])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      debug.log(`TypewriterEffect for message ${messageId} unmounting, cleaning up timeouts`)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [messageId])

  // Main typing effect
  useEffect(() => {
    if (!shouldRender) {
      return // Don't start typing if we shouldn't render
    }

    // If content is complete and we've displayed it all, stop typing
    if (isComplete && displayedContent === content) {
      debug.log(`Message ${messageId} is complete and fully displayed, stopping typing`)
      setIsTyping(false)
      return
    }

    // If there's no content, reset displayed content
    if (content === "") {
      debug.log(`Message ${messageId} has empty content, resetting displayed content`)
      setDisplayedContent("")
      return
    }

    // Check if content has changed completely
    if (!content.startsWith(displayedContent) && !displayedContent.startsWith(content)) {
      debug.log(`Content for message ${messageId} has changed completely, resetting displayed content`)
      setDisplayedContent("")
      lastContentLengthRef.current = 0
    }

    // Check if we need to type more characters
    if (displayedContent.length < content.length) {
      setIsTyping(true)

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Calculate delay based on character context
      const nextChar = content[displayedContent.length]
      const delay = getTypingDelay(displayedContent, nextChar, character)

      // Debug if content length has changed
      if (content.length !== lastContentLengthRef.current) {
        debug.log(
          `Content length changed for message ${messageId}: ${lastContentLengthRef.current} -> ${content.length}`,
        )
        lastContentLengthRef.current = content.length
      }

      timeoutRef.current = setTimeout(() => {
        // Check if content has changed since timeout was set
        if (contentRef.current !== content) {
          debug.log(`Content changed during timeout for message ${messageId}`)
          return
        }

        // Add the next character
        const newDisplayedContent = content.substring(0, displayedContent.length + 1)
        debug.log(
          `Adding character to message ${messageId}: "${nextChar}" (${displayedContent.length + 1}/${content.length})`,
        )
        setDisplayedContent(newDisplayedContent)
      }, delay)
    } else {
      debug.log(`Message ${messageId} is fully displayed, stopping typing`)
      setIsTyping(false)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [content, displayedContent, isComplete, character, shouldRender, messageId])

  // Function to determine typing delay based on context and character
  const getTypingDelay = (
    currentText: string,
    nextChar: string,
    character: "teenager" | "grandma" | "intellectual",
  ): number => {
    // Base delay - keep the slow typing as requested
    const baseDelay = character === "grandma" ? 30 : character === "intellectual" ? 27 : 15

    // For grandma, add random pauses to simulate hunting for keys
    const randomFactor = character === "grandma" ? (Math.random() < 0.1 ? 10 : 1) : 1

    // For intellectual, add dramatic pauses for full stops only
    if (character === "intellectual") {
      // Dramatic pause after full stops only
      if (currentText[currentText.length - 1] === ".") {
        return baseDelay * 30 // 50% longer dramatic pause for superior contemplation
      }
    }

    // Longer pause after sentence-ending punctuation
    if ([".", "!", "?"].includes(currentText[currentText.length - 1])) {
      return baseDelay * 10 * randomFactor // Longer pause after sentences
    }

    // Pause after commas
    if (currentText[currentText.length - 1] === ",") {
      return baseDelay * 5 * randomFactor // Medium pause after commas
    }

    // Pause before starting a new paragraph (if next char is newline)
    if (nextChar === "\n") {
      return baseDelay * 8 * randomFactor
    }

    // For grandma, occasionally add a very long pause to simulate distraction
    if (character === "grandma" && Math.random() < 0.03) {
      return baseDelay * 30 // "Where was I?" moment
    }

    // Slight variation in typing speed (simulate human inconsistency)
    return baseDelay * (0.7 + Math.random() * 0.6) * randomFactor
  }

  // Instead of early return, conditionally render the content
  if (!shouldRender) {
    return null
  }

  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown>{displayedContent}</ReactMarkdown>
    </div>
  )
}
