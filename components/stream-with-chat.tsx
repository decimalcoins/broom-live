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
  viewerToken: string
}

export function StreamWithChat({
  stream,
  viewerToken,
}: StreamWithChatProps) {
  const { userData } = usePiAuth()

  // ======================================================
  // ✅ Gift Animation State
  // ======================================================
  const [activeGifts, setActiveGifts] = useState<GiftEvent[]>([])

  // ======================================================
  // ✅ Coin Balance State (sync with backend userData)
  // ======================================================
  const [coinBalance, setCoinBalance] = useState<number>(0)

  // Sync balance whenever userData changes
  useEffect(() => {
    if (userData?.coin_balance !== undefined) {
      setCoinBalance(userData.coin_balance)
    }
  }, [userData])

  // ======================================================
  // ✅ Gift Received Handler
  // ======================================================
  const handleGiftReceived = (gift: GiftEvent) => {
    console.log("🎁 Gift Animation Triggered:", gift)

    setActiveGifts((prev) => [...prev, gift])
  }

  const handleGiftComplete = (giftId: string) => {
    setActiveGifts((prev) => prev.filter((g) => g.id !== giftId))
  }

  // ======================================================
  // ✅ LiveKit Gift Listener (Realtime)
  // ======================================================
  useEffect(() => {
    const onGiftEvent = (event: any) => {
      const giftData = event.detail
      if (!giftData) return

      handleGiftReceived(giftData)
    }

    window.addEventListener("livekit-gift", onGiftEvent)

    return () => {
      window.removeEventListener("livekit-gift", onGiftEvent)
    }
  }, [])

  // ======================================================
  // ✅ Gift Sent Handler (Balance Deduction)
  // ======================================================
  const handleGiftSent = (giftCost: number) => {
    setCoinBalance((prev) => Math.max(prev - giftCost, 0))

    console.log("🎁 Gift sent successfully! Cost:", giftCost)
  }

  // ======================================================
  // ✅ UI Render
  // ======================================================
  return (
    <ViewerStreamView stream={stream} viewerToken={viewerToken}>
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
        {/* Coin Balance */}
        <CoinBalance balance={coinBalance} />

        {/* Gift Picker */}
        <GiftPicker
          streamId={stream.id}
          hostId={stream.host_id}
          onGiftSent={handleGiftSent}
        />
      </div>

      {/* 💬 Chat Panel */}
      <ChatPanel username={userData?.username || "Viewer"} />
    </ViewerStreamView>
  )
}
