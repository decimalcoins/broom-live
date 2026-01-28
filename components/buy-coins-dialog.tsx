"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { usePiPayment } from "@/hooks/use-pi-payment"
import { piToCoins } from "@/lib/constants"
import { Coins } from "lucide-react"
import { api } from "@/lib/api"
import { API_ROUTES } from "@/lib/api-routes"

interface BuyCoinsDialogProps {
  onSuccess: () => void
}

export function BuyCoinsDialog({ onSuccess }: BuyCoinsDialogProps) {
  const [open, setOpen] = useState(false)
  const [piAmount, setPiAmount] = useState("1")
  const { createPayment, isProcessing, error } = usePiPayment()

  const handlePurchase = async () => {
    const amount = Number.parseFloat(piAmount)
    if (isNaN(amount) || amount <= 0) return

    const payment = await createPayment({
      amount,
      memo: `Purchase ${piToCoins(amount).toLocaleString()} coins`,
      metadata: {
        type: "coin_purchase",
        coins: piToCoins(amount),
      },
    })

    if (payment) {
      try {
        await api.post(API_ROUTES.PURCHASE_COINS, {
          payment_id: payment.identifier,
          pi_amount: amount,
          coin_amount: piToCoins(amount),
        })

        onSuccess()
        setOpen(false)
      } catch (err) {
        console.error("[v0] Failed to record coin purchase:", err)
      }
    }
  }

  const coinAmount = piToCoins(Number.parseFloat(piAmount) || 0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="lg" className="gap-2">
          <Coins className="w-5 h-5" />
          Buy Coins
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buy Coins with Pi</DialogTitle>
          <DialogDescription>1 Pi = 314,159 Coins</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="pi-amount">Pi Amount</Label>
            <Input
              id="pi-amount"
              type="number"
              min="0.1"
              step="0.1"
              value={piAmount}
              onChange={(e) => setPiAmount(e.target.value)}
              placeholder="Enter Pi amount"
            />
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">You will receive:</p>
            <p className="text-2xl font-bold">{coinAmount.toLocaleString()} Coins</p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button onClick={handlePurchase} disabled={isProcessing} className="w-full" size="lg">
            {isProcessing ? "Processing..." : "Purchase Coins"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
