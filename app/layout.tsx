import type React from "react"
import type { Metadata } from "next"

import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"

import { AppWrapper } from "@/components/app-wrapper"
import { AppSplash } from "@/components/app-splash" // ✅ Tambahan

import "./globals.css"

export const metadata: Metadata = {
  title: "Broom Live",
  description: "Pi Network Live Streaming App",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Geist Fonts Setup */}
        <style>{`
          html {
            font-family: ${GeistSans.style.fontFamily};
            --font-sans: ${GeistSans.variable};
            --font-mono: ${GeistMono.variable};
          }
        `}</style>
      </head>

      <body>
        {/* ✅ AppWrapper tetap */}
        <AppWrapper>
          {/* ✅ Splash hanya sekali saat pertama buka */}
          <AppSplash>{children}</AppSplash>
        </AppWrapper>
      </body>
    </html>
  )
}
