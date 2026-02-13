"use client"

import { useEffect, useState } from "react"

export function AppSplash({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false)

  useEffect(() => {
    const hasOpened = localStorage.getItem("broom_opened")

    // ✅ Jika belum pernah buka app → tampilkan splash
    if (!hasOpened) {
      setShowSplash(true)

      setTimeout(() => {
        setShowSplash(false)
        localStorage.setItem("broom_opened", "yes")
      }, 3000) // splash 3 detik
    }
  }, [])

  if (showSplash) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center space-y-4">
          <img
            src="/broom-logo.png"
            className="w-32 h-32 mx-auto animate-pulse"
            alt="Broom Logo"
          />

          <p className="text-white text-xl font-bold">
            Welcome to Broom Live
          </p>

          <p className="text-white/60 text-sm">
            Loading app...
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
