"use client"

import { useState, useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"

interface TypewriterEffectProps {
  content: string
  character: "teenager" | "grandma" | "intellectual" | "exec"
  messageId: string
  onTypingChange?: (isTyping: boolean) => void
}

export function TypewriterEffect({
  content,
  character,
  messageId,
  onTypingChange,
}: TypewriterEffectProps) {
  const [displayedContent, setDisplayedContent] = useState("")
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(Date.now())
  const commaTimeRef = useRef<number | null>(null)

  // Reset on new message
  useEffect(() => {
    setDisplayedContent("")
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    startTimeRef.current = Date.now()
    commaTimeRef.current = null
    // Notify parent that typing has stopped (new message starting)
    onTypingChange?.(false)
  }, [messageId, onTypingChange])

  // Type characters with delays
  useEffect(() => {
    if (displayedContent.length >= content.length) {
      // Finished typing - notify parent
      onTypingChange?.(false)
      return
    }

    // Started or continuing typing - notify parent
    onTypingChange?.(true)

    const nextChar = content[displayedContent.length]
    const delay = getTypingDelay(displayedContent, nextChar, character)
    
    // Debug logging for comma timing
    const currentTime = Date.now()
    const timeFromStart = currentTime - startTimeRef.current
    
    // Log when we hit the first comma
    if (nextChar === ',' && !commaTimeRef.current) {
      commaTimeRef.current = currentTime
      console.log(`[DEBUG] First comma reached at ${timeFromStart}ms from start`)
    }
    
    // Log the character after the comma
    if (commaTimeRef.current && displayedContent.length > 0 && displayedContent[displayedContent.length - 1] === ',') {
      console.log(`[DEBUG] Character after comma "${nextChar}" will appear in ${delay}ms (total: ${timeFromStart + delay}ms from start)`)
    }

    timeoutRef.current = setTimeout(() => {
      setDisplayedContent(content.substring(0, displayedContent.length + 1))
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [content, displayedContent, character, onTypingChange])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Don't render if no content
  if (!content) {
    return null
  }

  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown>{displayedContent}</ReactMarkdown>
    </div>
  )
}

function getTypingDelay(
  currentText: string,
  nextChar: string,
  character: "teenager" | "grandma" | "intellectual" | "exec"
): number {
  const lastChar = currentText[currentText.length - 1] || ""

  // Base delays by character
  const baseDelays = {
    grandma: 40,        // reduced from 80
    intellectual: 24,   // 20% slower than before (was 20)
    teenager: 25,       // reduced from 40
    exec: 20,           // keep same
  }

  let delay = baseDelays[character]

  // Add variation (human-like inconsistency)
  if (character === "intellectual" || character === "exec") {
    // Intellectual and exec are both smooth - minimal variation
    delay *= 0.95 + Math.random() * 0.1 // 95-105% of base delay
  } else {
    // Others have more variation
    delay *= 0.7 + Math.random() * 0.6
  }

  // Punctuation pauses
  if ([".", "!", "?"].includes(lastChar)) {
    switch (character) {
      case "grandma":
        delay += 200 + Math.random() * 300 // 200-500ms pause
        break
      case "intellectual":
        delay += 300 + Math.random() * 300 // 300-600ms dramatic pause
        break
      case "teenager":
        delay += 100 + Math.random() * 100 // 100-200ms normal pause
        break
      case "exec":
        delay += 50 + Math.random() * 50 // 50-100ms minimal pause
        break
    }
  }

  // Comma pauses
  if (lastChar === ",") {
    switch (character) {
      case "grandma":
        delay += 100 + Math.random() * 100
        break
      case "intellectual":
        delay += 150 + Math.random() * 100
        break
      case "teenager":
        delay += 50 + Math.random() * 50
        break
      case "exec":
        delay += 20 + Math.random() * 30
        break
    }
  }

  // Grandma-specific: "hunting for keys" moments
  if (character === "grandma" && Math.random() < 0.05) {
    delay += 300 + Math.random() * 400 // 300-700ms "where was I?" moment
  }


  return Math.round(delay)
}