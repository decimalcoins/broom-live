"use client"

import { useState } from "react"
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

  const handleGiftReceived = (gift: GiftEvent) => {
    setActiveGifts((prev) => [...prev, gift])
  }

  const handleGiftComplete = (giftId: string) => {
    setActiveGifts((prev) => prev.filter((g) => g.id !== giftId))
  }

  const handleGiftSent = () => {
    // Refresh coin balance after gift sent
    // In production, fetch from backend
  }

  return (
    <ViewerStreamView stream={stream}>
      {activeGifts.map((gift) => (
        <GiftAnimation key={gift.id} gift={gift} onComplete={() => handleGiftComplete(gift.id)} />
      ))}

      <div className="absolute top-20 right-4 flex flex-col gap-2">
        <CoinBalance balance={coinBalance} />
        <GiftPicker
          streamId={stream.id}
          hostId={stream.host_id}
          userCoinBalance={coinBalance}
          onGiftSent={handleGiftSent}
        />
      </div>

      <ChatPanel streamId={stream.id} onGiftReceived={handleGiftReceived} />
    </ViewerStreamView>
  )
}
