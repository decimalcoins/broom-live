"use client"

import { useState } from "react"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { useCoins } from "@/contexts/coin-context"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"

import { Button } from "./ui/button"
import { Input } from "./ui/input"

interface Props {
  coinBalance: number
  onSuccess: () => void
}

export function WithdrawalRequestDialog({ coinBalance, onSuccess }: Props) {
  const { userData } = usePiAuth()
  const { setBalance } = useCoins()

  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)

  const handleWithdraw = async () => {
    if (!userData) return

    const coinAmount = Number(amount)

    if (isNaN(coinAmount) || coinAmount <= 0) {
      alert("Enter valid coin amount")
      return
    }

    if (coinAmount > coinBalance) {
      alert("Not enough coins")
      return
    }

    try {
      setLoading(true)

      const res = await fetch("/api/withdrawals/request", {
        method: "POST",
        body: JSON.stringify({
          hostId: userData.id,
          hostUsername: userData.username,
          coinAmount,
        }),
      })

      const data = await res.json()

      if (!data.success) {
        alert(data.error)
        return
      }

      alert("✅ Withdrawal request submitted!")

      // Update balance locally
      setBalance(coinBalance - coinAmount)

      onSuccess()
      setOpen(false)
    } catch (err) {
      console.error(err)
      alert("Withdraw failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          Withdraw Coins → Pi
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Withdrawal</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Balance: <b>{coinBalance.toLocaleString()} coins</b>
        </p>

        <Input
          placeholder="Enter coin amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <Button
          onClick={handleWithdraw}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Processing..." : "Submit Request"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
