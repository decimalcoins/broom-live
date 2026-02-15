import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"

import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"

import "./globals.css"
import { Providers } from "@/components/providers"
import { AppSplash } from "@/components/app-splash" // ✅ ADD THIS

export const metadata: Metadata = {
  title: "Broom Live",
  description: "Pi Network Live Streaming App",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Load Pi Network SDK */}
        <Script
          src="https://sdk.minepi.com/pi-sdk.js"
          strategy="beforeInteractive"
        />

        {/* ✅ Fonts */}
        <style>{`
          html {
            font-family: ${GeistSans.style.fontFamily};
            --font-sans: ${GeistSans.variable};
            --font-mono: ${GeistMono.variable};
          }
        `}</style>
      </head>

      <body>
        {/* ✅ Splash wraps everything */}
        <AppSplash>
          <Providers>{children}</Providers>
        </AppSplash>
      </body>
    </html>
  )
}
