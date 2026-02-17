"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { AppSplash } from "@/components/app-splash"
import { usePiAuth } from "@/contexts/pi-auth-context"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, authMessage, reinitialize } = usePiAuth()

  // ============================
  // Auto Redirect After Login
  // ============================
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  return (
    <AppSplash>
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-6">
        <h1 className="text-4xl font-bold">BROOM LIVE</h1>

        {/* Auth Status */}
        <p className="text-muted-foreground text-lg">{authMessage}</p>

        {/* Retry Button if Failed */}
        {!isAuthenticated && authMessage.includes("❌") && (
          <button
            onClick={reinitialize}
            className="px-6 py-3 bg-black text-white rounded-xl"
          >
            Retry Login
          </button>
        )}

        {/* Optional Manual Links */}
        {!isAuthenticated && (
          <p className="text-sm text-gray-500">
            Please open inside Pi Browser to continue.
          </p>
        )}
      </main>
    </AppSplash>
  )
}
