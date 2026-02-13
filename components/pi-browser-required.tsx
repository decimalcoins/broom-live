"use client"

import { useEffect, useState } from "react"

export function PiBrowserRequired() {
  const [ready, setReady] = useState(false)
  const [isPi, setIsPi] = useState(false)

  useEffect(() => {
    let attempts = 0

    const checkPi = () => {
      attempts++

      // ✅ Kalau Pi SDK sudah muncul
      if (typeof (window as any).Pi !== "undefined") {
        console.log("✅ Pi SDK detected!")
        setIsPi(true)
        setReady(true)
        return
      }

      // Tunggu sampai max 20x (≈4 detik)
      if (attempts < 20) {
        setTimeout(checkPi, 200)
      } else {
        console.log("❌ Pi SDK not found after waiting")
        setIsPi(false)
        setReady(true)
      }
    }

    checkPi()
  }, [])

  // Loading dulu jangan render apa-apa
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p>⏳ Checking Pi Browser...</p>
      </div>
    )
  }

  // Kalau Pi Browser → lanjut normal
  if (isPi) return null

  // Kalau bukan Pi Browser → tampilkan warning
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold">🚫 Pi Browser Required</h1>

        <p className="text-gray-300">
          Aplikasi <b>Broom Live</b> hanya bisa dibuka menggunakan{" "}
          <b>Pi Browser</b>.
        </p>

        <p className="text-sm text-gray-400">
          Silakan buka aplikasi ini dari Pi Network App Platform.
        </p>

        <div className="mt-4 p-3 bg-gray-800 rounded-xl text-sm">
          ⚡ Pastikan kamu membuka dari Pi Mining App → Browser → App
        </div>
      </div>
    </div>
  )
}
