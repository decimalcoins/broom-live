"use client"

import type { ReactNode } from "react"

import { PiAuthProvider } from "@/contexts/pi-auth-context"
import { CoinProvider } from "@/contexts/coin-context"

import { AppSplash } from "@/components/app-splash"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppSplash>
      <PiAuthProvider>
        <CoinProvider>{children}</CoinProvider>
      </PiAuthProvider>
    </AppSplash>
  )
}
