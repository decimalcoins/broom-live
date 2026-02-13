"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { Button } from "./ui/button"
import { Coins, Gift } from "lucide-react"
import { getLoginBonus } from "@/lib/constants"

interface LoginBonusDialogProps {
  loginOrder: number
  bonusCoins: number
  onClose: () => void
}

export function LoginBonusDialog({ loginOrder, bonusCoins, onClose }: LoginBonusDialogProps) {
  const [open, setOpen] = useState(true)
  const bonus = getLoginBonus(loginOrder)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Welcome to BROOM!</DialogTitle>
          <DialogDescription className="text-center">You are user #{loginOrder}</DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Gift className="w-10 h-10 text-yellow-500" />
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">You received</p>
              <div className="flex items-center justify-center gap-2">
                <Coins className="w-8 h-8 text-yellow-500" />
                <span className="text-4xl font-bold">{bonusCoins.toLocaleString()}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Bonus Coins</p>
            </div>
          </div>

          {bonus.entry_cost_pi > 0 && (
            <div className="rounded-lg bg-muted p-3 text-center text-sm">
              <p className="text-muted-foreground">
                Entry cost: <span className="font-bold">{bonus.entry_cost_pi} Pi</span>
              </p>
            </div>
          )}
        </div>

        <Button onClick={onClose} size="lg" className="w-full">
          Start Watching
        </Button>
      </DialogContent>
    </Dialog>
  )
}
