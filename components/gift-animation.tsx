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

  // ============================
  // ✅ SAFE FALLBACK SUPPORT
  // ============================

  // Backend gift format: gift.gift.image_url
  // DEV mock format: gift.image_url

  const giftIcon =
    (gift as any)?.gift?.image_url ||
    (gift as any)?.image_url ||
    "🎁"

  const giftName =
    (gift as any)?.gift?.name ||
    (gift as any)?.gift_name ||
    "Gift"

  const sender =
    (gift as any)?.sender_username ||
    "Someone"

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center animate-in fade-in zoom-in duration-300">
      <div className="bg-black/80 backdrop-blur-md rounded-2xl p-8 text-white text-center animate-bounce">
        <div className="text-6xl mb-3">{giftIcon}</div>

        <p className="text-2xl font-bold mb-1">{giftName}</p>

        <p className="text-lg text-white/70">
          from @{sender}
        </p>
      </div>
    </div>
  )
}