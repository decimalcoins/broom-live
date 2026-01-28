"use client"

import { Coins } from "lucide-react"
import { Card } from "./ui/card"

interface CoinBalanceProps {
  balance: number
  className?: string
}

export function CoinBalance({ balance, className = "" }: CoinBalanceProps) {
  return (
    <Card className={`px-4 py-2 flex items-center gap-2 ${className}`}>
      <Coins className="w-5 h-5 text-yellow-500" />
      <span className="font-bold text-lg">{balance.toLocaleString()}</span>
    </Card>
  )
}
