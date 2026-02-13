"use client"

import { useEffect, useState } from "react"

export function SplashScreen() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Splash tampil selama 5 detik
    const timer = setTimeout(() => {
      setVisible(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  // Kalau sudah selesai → hilang total
  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-white transition-opacity duration-700">
      
      {/* LOGO */}
      <img
        src="/broom-logo.png"
        alt="Broom Live Logo"
        className="w-32 h-32 mb-6 animate-zoom"
      />

      {/* APP NAME */}
      <h1 className="text-3xl font-bold tracking-wide">
        BROOM LIVE
      </h1>

      {/* TAGLINE */}
      <p className="text-sm text-white/60 mt-2">
        Streaming with Pi Network
      </p>

      {/* LOADING SPINNER */}
      <div className="mt-8 w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  )
}
