"use client"

import { useEffect, useState } from "react"

import { ViewerStreamView } from "./viewer-stream-view"
import { ChatPanel } from "./chat-panel"
import { GiftAnimation } from "./gift-animation"
import { GiftPicker } from "./gift-picker"
import { CoinBalance } from "./coin-balance"

import type { Stream, GiftEvent } from "@/lib/types"
import { usePiAuth } from "@/contexts/pi-auth-context"

interface StreamWithChatProps {
  stream: Stream
}

export function StreamWithChat({ stream }: StreamWithChatProps) {
  const { userData } = usePiAuth()

  const [activeGifts, setActiveGifts] = useState<GiftEvent[]>([])
  const [coinBalance, setCoinBalance] = useState(userData?.coin_balance || 0)

  // ======================================================
  // ✅ Gift Received Handler (Animation)
  // ======================================================
  const handleGiftReceived = (gift: GiftEvent) => {
    console.log("🎁 Gift Animation Triggered:", gift)
    setActiveGifts((prev) => [...prev, gift])
  }

  const handleGiftComplete = (giftId: string) => {
    setActiveGifts((prev) => prev.filter((g) => g.id !== giftId))
  }

  // ======================================================
  // ✅ LIVEKIT REALTIME GIFT LISTENER
  // ======================================================
  useEffect(() => {
    const onGiftEvent = (event: any) => {
      const msg = event.detail
      if (!msg || msg.type !== "gift") return

      handleGiftReceived(msg.data)
    }

    window.addEventListener("livekit-gift", onGiftEvent)

    return () => {
      window.removeEventListener("livekit-gift", onGiftEvent)
    }
  }, [])

  // ======================================================
  // ✅ Gift Sent Handler (REAL)
  // ======================================================
  const handleGiftSent = async (giftCost?: number) => {
    if (!giftCost) return

    // Update local balance instantly
    setCoinBalance((prev) => Math.max(prev - giftCost, 0))

    console.log("🎁 Gift sent successfully!")
  }

  // ======================================================
  // ✅ UI Render
  // ======================================================
  return (
    <ViewerStreamView stream={stream}>
      {/* 🎁 Gift Animations */}
      {activeGifts.map((gift) => (
        <GiftAnimation
          key={gift.id}
          gift={gift}
          onComplete={() => handleGiftComplete(gift.id)}
        />
      ))}

      {/* Right Overlay */}
      <div className="absolute top-20 right-4 flex flex-col gap-2 z-50">
        <CoinBalance balance={coinBalance} />

        <GiftPicker
          streamId={stream.id}
          hostId={stream.host_id}
          onGiftSent={(giftCost) => handleGiftSent(giftCost)}
        />
      </div>

      {/* Chat Panel */}
      <ChatPanel streamId={stream.id} />
    </ViewerStreamView>
  )
}
