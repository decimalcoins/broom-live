"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Gift } from "lucide-react"
import { Card } from "./ui/card"
import { api } from "@/lib/api"
import { API_ROUTES } from "@/lib/api-routes"
import type { Gift as GiftType } from "@/lib/types"
import { Coins } from "lucide-react"

interface GiftPickerProps {
  streamId: string
  hostId: string
  userCoinBalance: number
  onGiftSent: () => void
}

export function GiftPicker({ streamId, hostId, userCoinBalance, onGiftSent }: GiftPickerProps) {
  const [open, setOpen] = useState(false)
  const [gifts, setGifts] = useState<GiftType[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (open) {
      fetchGifts()
    }
  }, [open])

  const fetchGifts = async () => {
    setLoading(true)
    try {
      const response = await api.get<GiftType[]>(API_ROUTES.GET_GIFTS)
      setGifts(response.data)
    } catch (err) {
      console.error("[v0] Failed to fetch gifts:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSendGift = async (gift: GiftType) => {
    if (userCoinBalance < gift.coin_cost) {
      alert("Insufficient coins")
      return
    }

    setSending(true)
    try {
      await api.post(API_ROUTES.SEND_GIFT, {
        stream_id: streamId,
        host_id: hostId,
        gift_id: gift.id,
      })

      onGiftSent()
      setOpen(false)
    } catch (err) {
      console.error("[v0] Failed to send gift:", err)
      alert("Failed to send gift")
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="lg" className="gap-2">
          <Gift className="w-5 h-5" />
          Send Gift
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send a Gift</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">
            <p>Loading gifts...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 py-4 max-h-96 overflow-y-auto">
            {gifts.map((gift) => {
              const canAfford = userCoinBalance >= gift.coin_cost

              return (
                <Card
                  key={gift.id}
                  className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                    canAfford ? "hover:border-primary" : "opacity-50 cursor-not-allowed"
                  }`}
                  onClick={() => canAfford && !sending && handleSendGift(gift)}
                >
                  <div className="text-4xl text-center mb-2">{gift.image_url}</div>
                  <p className="text-sm font-medium text-center mb-1">{gift.name}</p>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Coins className="w-3 h-3 text-yellow-500" />
                    <span>{gift.coin_cost.toLocaleString()}</span>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <p className="text-sm text-muted-foreground">Your balance:</p>
          <div className="flex items-center gap-1">
            <Coins className="w-4 h-4 text-yellow-500" />
            <span className="font-bold">{userCoinBalance.toLocaleString()}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
