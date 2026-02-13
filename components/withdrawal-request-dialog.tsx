"use client"

import { useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "./ui/dialog"

import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

import { ArrowUpCircle, Coins } from "lucide-react"

import { api } from "@/lib/api"
import { API_ROUTES } from "@/lib/api-routes"
import { coinsToPi, DEFAULT_CONFIG } from "@/lib/constants"

/* ✅ Coin Context */
import { useCoins } from "@/contexts/coin-context"

interface WithdrawalRequestDialogProps {
  onSuccess: () => void
}

export function WithdrawalRequestDialog({ onSuccess }: WithdrawalRequestDialogProps) {
  const [open, setOpen] = useState(false)
  const [coinAmount, setCoinAmount] = useState("")
  const [requesting, setRequesting] = useState(false)

  /* ✅ realtime balance */
  const { balance, setBalance } = useCoins()

  const handleRequest = async () => {
    const amount = Number.parseInt(coinAmount)

    if (isNaN(amount) || amount <= 0 || amount > balance) return

    setRequesting(true)

    try {
      // ============================
      // DEV MODE → Simulate Withdrawal
      // ============================
      if (process.env.NEXT_PUBLIC_APP_MODE === "dev") {
        console.warn("⚡ DEV MODE: Simulating withdrawal request")

        // Kurangi saldo langsung
        setBalance(balance - amount)

        alert(`DEV MODE: Withdrawal request submitted for ${amount} coins`)

        onSuccess()
        setOpen(false)
        setCoinAmount("")
        return
      }

      // ============================
      // PROD MODE → Backend Withdrawal
      // ============================
      await api.post(API_ROUTES.REQUEST_WITHDRAWAL, {
        coin_amount: amount,
      })

      // Kurangi saldo realtime setelah request sukses
      setBalance(balance - amount)

      onSuccess()
      setOpen(false)
      setCoinAmount("")
    } catch (err) {
      console.error("❌ Failed to request withdrawal:", err)
      alert("Failed to request withdrawal")
    } finally {
      setRequesting(false)
    }
  }

  const amount = Number.parseInt(coinAmount) || 0
  const piAmount = coinsToPi(amount)

  const platformFee = amount * (DEFAULT_CONFIG.platform_fee_percentage / 100)
  const netPiAmount = coinsToPi(amount - platformFee)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" variant="outline" className="w-full gap-2 bg-transparent">
          <ArrowUpCircle className="w-5 h-5" />
          Request Withdrawal
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Pi Withdrawal</DialogTitle>
          <DialogDescription>Convert your coins to Pi</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Balance */}
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <div className="flex items-center gap-2 mt-1">
              <Coins className="w-5 h-5 text-yellow-500" />
              <span className="text-2xl font-bold">
                {balance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <Label htmlFor="coin-amount">Coin Amount</Label>
            <Input
              id="coin-amount"
              type="number"
              min="1"
              max={balance}
              value={coinAmount}
              onChange={(e) => setCoinAmount(e.target.value)}
              placeholder="Enter coin amount"
            />
          </div>

          {/* Preview */}
          {amount > 0 && (
            <div className="space-y-2 rounded-lg border p-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Coins:</span>
                <span className="font-medium">{amount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pi Value:</span>
                <span className="font-medium">{piAmount.toFixed(4)} Pi</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Platform Fee ({DEFAULT_CONFIG.platform_fee_percentage}%):
                </span>
                <span className="font-medium text-red-500">
                  -{platformFee.toLocaleString()} coins
                </span>
              </div>

              <div className="flex justify-between text-base font-bold pt-2 border-t">
                <span>You'll Receive:</span>
                <span className="text-green-500">
                  {netPiAmount.toFixed(4)} Pi
                </span>
              </div>
            </div>
          )}

          {/* Submit */}
          <Button
            onClick={handleRequest}
            disabled={requesting || amount <= 0 || amount > balance}
            className="w-full"
            size="lg"
          >
            {requesting ? "Requesting..." : "Submit Request"}
          </Button>

          {/* DEV Notice */}
          {process.env.NEXT_PUBLIC_APP_MODE === "dev" && (
            <p className="text-xs text-muted-foreground text-center">
              ⚡ DEV MODE: Withdrawal is simulated (no real payout)
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}