"use client"

import { useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"

import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

import { Coins } from "lucide-react"

import { usePiPayment } from "@/hooks/use-pi-payment"
import { piToCoins } from "@/lib/constants"
import { api } from "@/lib/api"
import { API_ROUTES } from "@/lib/api-routes"

/* ✅ Coin Context */
import { useCoins } from "@/contexts/coin-context"

interface BuyCoinsDialogProps {
  onSuccess: () => void
}

export function BuyCoinsDialog({ onSuccess }: BuyCoinsDialogProps) {
  const [open, setOpen] = useState(false)
  const [piAmount, setPiAmount] = useState("1")

  const { createPayment, isProcessing, error } = usePiPayment()

  /* ✅ realtime coin update */
  const { addCoins } = useCoins()

  const handlePurchase = async () => {
    const amount = Number.parseFloat(piAmount)
    if (isNaN(amount) || amount <= 0) return

    const coinsToAdd = piToCoins(amount)

    // ============================
    // ✅ DEV MODE → Dummy Purchase
    // ============================
    if (process.env.NEXT_PUBLIC_APP_MODE === "dev") {
      console.warn("⚡ DEV MODE: Simulating coin purchase")

      // langsung tambah balance realtime
      addCoins(coinsToAdd)

      alert(
        `DEV MODE SUCCESS 🎉\nYou purchased ${coinsToAdd.toLocaleString()} coins`
      )

      onSuccess()
      setOpen(false)
      return
    }

    // ============================
    // ✅ PROD MODE → Real Pi Payment
    // ============================
    const payment = await createPayment({
      amount,
      memo: `Purchase ${coinsToAdd.toLocaleString()} coins`,
      metadata: {
        type: "coin_purchase",
        coins: coinsToAdd,
      },
    })

    if (payment) {
      try {
        // Record purchase to backend
        await api.post(API_ROUTES.PURCHASE_COINS, {
          payment_id: payment.identifier,
          pi_amount: amount,
          coin_amount: coinsToAdd,
        })

        // ✅ Update balance realtime after success
        addCoins(coinsToAdd)

        onSuccess()
        setOpen(false)
      } catch (err) {
        console.error("❌ Failed to record coin purchase:", err)
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
          {/* Input */}
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

          {/* Preview */}
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">You will receive:</p>
            <p className="text-2xl font-bold">
              {coinAmount.toLocaleString()} Coins
            </p>
          </div>

          {/* Error */}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Button */}
          <Button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? "Processing..." : "Purchase Coins"}
          </Button>

          {/* DEV Notice */}
          {process.env.NEXT_PUBLIC_APP_MODE === "dev" && (
            <p className="text-xs text-muted-foreground text-center">
              ⚡ DEV MODE: Payment is simulated (no real Pi transaction)
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}