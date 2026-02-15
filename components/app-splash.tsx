"use client"

import { useEffect, useState } from "react"

export function AppSplash({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (showSplash) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center space-y-4">
          <img
            src="/broom-logo.png"
            className="w-28 h-28 mx-auto animate-pulse"
            alt="Broom Logo"
          />
          <p className="text-white text-xl font-bold">
            Welcome to Broom Live
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
