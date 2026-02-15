"use client"

import type { ReactNode } from "react"

import { PiAuthProvider } from "@/contexts/pi-auth-context"
import { CoinProvider } from "@/contexts/coin-context"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PiAuthProvider>
      {/* ✅ CoinProvider MUST be inside PiAuthProvider */}
      <CoinProvider>{children}</CoinProvider>
    </PiAuthProvider>
  )
}
