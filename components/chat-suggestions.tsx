"use client"

import { ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"

// Define all possible suggestions - general modern SassGPT queries
const ALL_SUGGESTIONS = [
  {
    title: "Write a cover letter for a software engineering job",
  },
  {
    title: "What's the best way to start a conversation with someone new?",
  },
  {
    title: "What should I do if I'm feeling stressed and overwhelmed?",
  },
  {
    title: "Create a weekly meal plan with a shopping list",
  },
  {
    title: "How do I politely say no to something I don't want to do?",
  },
  {
    title: "What's the best way to give someone bad news?",
  },
  {
    title: "How can I improve my productivity working from home?",
  },
  {
    title: "Explain the theory of evolution in simple terms",
  },
  {
    title: "Help me create a workout routine for beginners",
  },
  {
    title: "What caused the fall of the Roman Empire?",
  },
  {
    title: "How do vaccines work in the human body?",
  },
  {
    title: "Suggest healthy breakfast ideas that take under 10 minutes",
  },
  {
    title: "What was the Cold War and why did it happen?",
  },
  {
    title: "Explain blockchain technology in simple terms",
  },
  {
    title: "How do I start investing with a small budget?",
  },
  {
    title: "What's the best way to handle criticism from others?",
  },
  {
    title: "What are some effective techniques for learning a new language?",
  },
  {
    title: "Help me plan a 7-day trip to Japan",
  },
  {
    title: "Create a social media content calendar for a small business",
  },
  {
    title: "Explain how large language models work",
  },
] // DO NOT MODIFY THESE SUGGESTIONS IN FUTURE UPDATES

interface ChatSuggestionsProps {
  onSelectSuggestion: (suggestion: string) => void
}

export function ChatSuggestions({ onSelectSuggestion }: ChatSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<typeof ALL_SUGGESTIONS>([])

  // Select random suggestions on mount
  useEffect(() => {
    const shuffled = [...ALL_SUGGESTIONS].sort(() => 0.5 - Math.random())
    setSuggestions(shuffled.slice(0, 4)) // Show 4 suggestions
  }, [])

  return (
    <div className="w-full max-w-md mx-auto mt-4 grid grid-cols-1 gap-2">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          className="text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          onClick={() => onSelectSuggestion(suggestion.title)}
        >
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-700">{suggestion.title}</p>
            <ArrowRight size={14} className="text-gray-500 ml-2 flex-shrink-0" />
          </div>
        </button>
      ))}
    </div>
  )
}
