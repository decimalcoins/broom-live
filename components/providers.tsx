"use client"

import React from "react"

import { PiAuthProvider } from "@/contexts/pi-auth-context"
import { CoinProvider } from "@/contexts/coin-context"

import { AppWrapper } from "@/components/app-wrapper"
import { AppSplash } from "@/components/app-splash"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PiAuthProvider>
      <CoinProvider>
        <AppWrapper>
          <AppSplash>{children}</AppSplash>
        </AppWrapper>
      </CoinProvider>
    </PiAuthProvider>
  )
}
