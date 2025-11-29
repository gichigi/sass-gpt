import type React from "react"
import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SassGPT — AI with Attitude",
  description: "ChatGPT with attitude. AI conversations with sass and character.",
  keywords: [
    "AI chat",
    "artificial intelligence",
    "chatbot",
    "AI personalities",
    "sassy AI",
    "AI with attitude",
    "conversational AI",
    "GPT-4o-mini",
    "OpenAI",
    "chat application"
  ],
  authors: [{ name: "SassGPT Team" }],
  creator: "SassGPT",
  publisher: "SassGPT",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sassgpt.vercel.app",
    siteName: "SassGPT",
    title: "SassGPT — AI with Attitude",
    description: "ChatGPT with attitude. AI conversations with sass and character.",
    images: [
      {
        url: "https://sassgpt.vercel.app/chatgpt-logo.png",
        width: 1200,
        height: 630,
        alt: "SassGPT - AI with Attitude",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@sassgpt",
    creator: "@sassgpt",
    title: "SassGPT — AI with Attitude",
    description: "ChatGPT with attitude. AI conversations with sass and character.",
    images: ["https://sassgpt.vercel.app/chatgpt-logo.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  colorScheme: "dark light",
  appleWebApp: {
    capable: true,
    title: "SassGPT",
    statusBarStyle: "default",
  },
  alternates: {
    canonical: "https://sassgpt.vercel.app",
  },
  category: "technology",
  classification: "AI Chat Application",
  generator: "Next.js",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#ffffff",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "SassGPT",
    "alternateName": "SassGPT — AI with Attitude",
    "description": "Experience AI conversations with personality, sass, and zero filter. Chat with distinct AI characters that bring authentic personality to every conversation.",
    "url": "https://sassgpt.vercel.app",
    "applicationCategory": "ChatApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "SassGPT Team"
    },
    "featureList": [
      "AI Chat with Multiple Personalities",
      "Real-time Streaming Responses",
      "Mobile-First Design",
      "Modern UI/UX",
      "Auto-scroll Functionality",
      "Copy & Feedback System"
    ],
    "screenshot": "https://sassgpt.vercel.app/chatgpt-logo.png",
    "softwareVersion": "1.0.0",
    "datePublished": "2025-10-21",
    "dateModified": "2025-10-21",
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "softwareRequirements": "Web browser",
    "memoryRequirements": "512MB RAM",
    "storageRequirements": "50MB",
    "permissions": "No special permissions required"
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
