"use client"

import { useEffect, useState } from "react"

export function StreamSplash({
  children,
  label = "Preparing Stream...",
}: {
  children?: React.ReactNode
  label?: string
}) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center space-y-4">
          {/* ✅ Logo */}
          <img
            src="/broom-logo.png"
            alt="Broom Live"
            className="w-24 h-24 mx-auto animate-pulse"
          />

          {/* ✅ Title */}
          <p className="text-white text-xl font-bold">{label}</p>

          {/* ✅ Subtitle */}
          <p className="text-white/50 text-sm">
            Connecting to LiveKit room...
          </p>

          {/* ✅ Loader Bar */}
          <div className="w-48 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
            <div className="h-full w-2/3 bg-white animate-pulse rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  // ✅ children safe fallback
  return <>{children || null}</>
}
