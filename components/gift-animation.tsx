"use client"

import { useEffect, useState } from "react"
import type { GiftEvent } from "@/lib/types"

interface GiftAnimationProps {
  gift: GiftEvent
  onComplete: () => void
}

export function GiftAnimation({ gift, onComplete }: GiftAnimationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onComplete()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center animate-in fade-in zoom-in duration-300">
      <div className="bg-black/80 backdrop-blur-md rounded-2xl p-8 text-white text-center animate-bounce">
        <div className="text-6xl mb-3">{gift.gift.image_url}</div>
        <p className="text-2xl font-bold mb-1">{gift.gift.name}</p>
        <p className="text-lg text-white/70">from @{gift.sender_username}</p>
      </div>
    </div>
  )
}
