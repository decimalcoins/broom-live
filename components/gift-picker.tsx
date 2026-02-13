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
import { useLiveKit } from "@/hooks/use-livekit"

interface GiftPickerProps {
  streamId: string
  hostId: string
  onGiftSent: () => void
}

export function GiftPicker({ streamId, hostId, onGiftSent }: GiftPickerProps) {
  const [open, setOpen] = useState(false)
  const [gifts, setGifts] = useState<GiftType[]>([])

  const { balance, setBalance } = useCoins()
  const { userData } = usePiAuth()

  // ✅ LiveKit Hook (viewer side)
  const roomName = `broom_${hostId}`
  const { sendData } = useLiveKit(roomName, null)

  // Load mock gifts
  useEffect(() => {
    if (!open) return

    setGifts([
      { id: "1", name: "Rose 🌹", coin_cost: 10, image_url: "🌹" },
      { id: "2", name: "Diamond 💎", coin_cost: 50, image_url: "💎" },
      { id: "3", name: "Rocket 🚀", coin_cost: 100, image_url: "🚀" },
    ] as any)
  }, [open])

  // ======================================================
  // ✅ Send Gift Realtime
  // ======================================================
  const handleSendGift = async (gift: GiftType) => {
    if (balance < gift.coin_cost) {
      alert("❌ Not enough coins")
      return
    }

    // Deduct balance instantly
    setBalance(balance - gift.coin_cost)

    // ✅ Publish gift event via LiveKit DataChannel
    sendData({
      type: "gift",
      data: {
        id: `gift-${Date.now()}`,
        sender_username: userData?.username,
        gift,
      },
    })

    console.log("🎁 Gift Sent:", gift.name)

    onGiftSent()
    setOpen(false)
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
              className="p-4 cursor-pointer hover:scale-105 transition"
              onClick={() => handleSendGift(gift)}
            >
              <div className="text-4xl text-center mb-2">
                {gift.image_url}
              </div>

              <p className="text-sm font-medium text-center">
                {gift.name}
              </p>

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
          <b>{balance} coins</b>
        </div>
      </DialogContent>
    </Dialog>
  )
}