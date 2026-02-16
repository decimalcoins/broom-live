"use client"

import Link from "next/link"
import { usePiAuth } from "@/contexts/pi-auth-context"

export default function HomePage() {
  const { isAuthenticated, userData } = usePiAuth()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center gap-6">
      <h1 className="text-4xl font-bold">Broom Live</h1>
      <p className="text-muted-foreground">
        Watch and interact with live streams
      </p>

      {isAuthenticated && userData ? (
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-black text-white rounded-xl"
        >
          Go to Dashboard
        </Link>
      ) : (
        <p>Login required in Pi Browser</p>
      )}
    </div>
  )
}
