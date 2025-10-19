import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SassGPT - AI with Attitude",
  description: "Chat with AI models that don't hold back - featuring sassy personalities with attitude. Choose from The Teenager, The Grandma, The Intellectual, or The Exec.",
  keywords: ["AI", "ChatGPT", "SassGPT", "AI Chat", "Personality AI", "Sassy AI", "AI with Attitude"],
  authors: [{ name: "SassGPT Team" }],
  creator: "SassGPT",
  publisher: "SassGPT",
  robots: "index, follow",
  openGraph: {
    title: "SassGPT - AI with Attitude",
    description: "Chat with AI models that don't hold back - featuring sassy personalities with attitude",
    url: "https://sass-gpt.vercel.app",
    siteName: "SassGPT",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "SassGPT Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SassGPT - AI with Attitude",
    description: "Chat with AI models that don't hold back - featuring sassy personalities with attitude",
    images: ["/icon-512.png"],
    creator: "@sassgpt",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16", type: "image/x-icon" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}

import "./globals.css"
