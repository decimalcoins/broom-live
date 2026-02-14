"use client"

import { PiAuthProvider } from "@/contexts/pi-auth-context"
import { CoinProvider } from "@/contexts/coin-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PiAuthProvider>
      <CoinProvider>{children}</CoinProvider>
    </PiAuthProvider>
  )
}
