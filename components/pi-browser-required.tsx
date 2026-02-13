"use client"

import { useEffect, useState } from "react"
import { waitForPiSDK } from "@/lib/pi-browser"

export function PiBrowserRequired() {
  const [ready, setReady] = useState(false)
  const [isPi, setIsPi] = useState(false)

  useEffect(() => {
    const init = async () => {
      const detected = await waitForPiSDK()
      setIsPi(detected)
      setReady(true)
    }

    init()
  }, [])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p>⏳ Checking Pi Browser...</p>
      </div>
    )
  }

  if (isPi) return null

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold">🚫 Pi Browser Required</h1>
        <p className="text-gray-300">
          Broom Live hanya bisa dibuka menggunakan <b>Pi Browser</b>.
        </p>
      </div>
    </div>
  )
}
