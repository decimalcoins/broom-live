"use client"

import Link from "next/link"
import { AppSplash } from "@/components/app-splash"

export default function HomePage() {
  return (
    <AppSplash>
      <main className="min-h-screen flex flex-col items-center justify-center gap-6">
        <h1 className="text-4xl font-bold">BROOM LIVE</h1>

        <p className="text-muted-foreground">
          Watch & interact with live streams
        </p>

        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-black text-white rounded-xl"
          >
            Enter Dashboard
          </Link>

          <Link
            href="/streams"
            className="px-6 py-3 border rounded-xl"
          >
            Live Now
          </Link>
        </div>
      </main>
    </AppSplash>
  )
}
