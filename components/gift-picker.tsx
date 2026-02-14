"use client"

import { useState, useEffect } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"

import { Button } from "./ui/button"
import { Card } from "./ui/card"

import { Gift, Coins } from "lucide-react"

import type { Gift as GiftType } from "@/lib/types"
import { useCoins } from "@/contexts/coin-context"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { useLiveKitRoom } from "@/contexts/livekit-context"

interface GiftPickerProps {
  streamId: string
  hostId: string
  onGiftSent: (giftCost: number) => void
}

export function GiftPicker({ streamId, hostId, onGiftSent }: GiftPickerProps) {
  const [open, setOpen] = useState(false)
  const [gifts, setGifts] = useState<GiftType[]>([])
  const [sending, setSending] = useState(false)

  const { balance, setBalance } = useCoins()
  const { userData } = usePiAuth()

  // ✅ Use existing LiveKit Room from Provider
  const { room } = useLiveKitRoom()

  // ============================
  // Load Gifts (Static List)
  // ============================
  useEffect(() => {
    if (!open) return

    setGifts([
      { id: "1", name: "Rose 🌹", coin_cost: 1, image_url: "🌹" },
      { id: "2", name: "Diamond 💎", coin_cost: 50, image_url: "💎" },
      { id: "3", name: "Rocket 🚀", coin_cost: 100, image_url: "🚀" },
    ] as any)
  }, [open])

  // ======================================================
  // ✅ Send Gift (Backend + LiveKit Realtime)
  // ======================================================
  const handleSendGift = async (gift: GiftType) => {
    if (!userData) {
      alert("Login required")
      return
    }

    if (!room) {
      alert("Live room not connected")
      return
    }

    if (balance < gift.coin_cost) {
      alert("❌ Not enough coins")
      return
    }

    if (sending) return
    setSending(true)

    try {
      // ============================
      // 1. Call Backend Gift API
      // ============================
      const res = await fetch("/api/gifts/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streamId, // UUID string
          senderId: userData.id,
          giftId: gift.id,
          giftAmount: gift.coin_cost,
        }),
      })

      const data = await res.json()

      if (!data.success) {
        alert("❌ Gift failed: " + data.error)
        return
      }

      // ============================
      // 2. Update Balance Locally
      // ============================
      setBalance(balance - gift.coin_cost)

      // ============================
      // 3. Send Gift Realtime to Host
      // ============================
      room.localParticipant.publishData(
        new TextEncoder().encode(
          JSON.stringify({
            type: "gift",
            data: {
              id: `gift-${Date.now()}`,
              sender_username: userData.username,
              gift,
            },
          })
        ),
        { reliable: true }
      )

      console.log("🎁 Gift Sent Successfully:", gift.name)

      onGiftSent(gift.coin_cost)
      setOpen(false)
    } catch (err) {
      console.error("❌ Gift Send Error:", err)
      alert("Gift failed. Try again.")
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Gift className="w-5 h-5" />
          Send Gift
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send a Gift</DialogTitle>
        </DialogHeader>

        {/* Gift List */}
        <div className="grid grid-cols-2 gap-3 py-4">
          {gifts.map((gift) => (
            <Card
              key={gift.id}
              className={`p-4 cursor-pointer hover:scale-105 transition ${
                sending ? "opacity-50 pointer-events-none" : ""
              }`}
              onClick={() => handleSendGift(gift)}
            >
              <div className="text-4xl text-center mb-2">
                {gift.image_url}
              </div>

              <p className="text-sm font-medium text-center">{gift.name}</p>

              <div className="flex items-center justify-center gap-1 text-xs">
                <Coins className="w-3 h-3" />
                {gift.coin_cost}
              </div>
            </Card>
          ))}
        </div>

        {/* Balance */}
        <div className="flex justify-between border-t pt-2 text-sm">
          <span>Your balance:</span>
          <b>{balance.toLocaleString()} coins</b>
        </div>

        {sending && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Sending gift...
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
