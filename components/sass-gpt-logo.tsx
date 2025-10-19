import { MessageCircle } from "lucide-react"

export function SassGPTLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <MessageCircle className="w-full h-full" />
    </div>
  )
}
