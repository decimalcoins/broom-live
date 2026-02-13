"use client"

import type { ReactNode } from "react"

import { PiAuthProvider, usePiAuth } from "@/contexts/pi-auth-context"
import { CoinProvider } from "@/contexts/coin-context"

import { AuthLoadingScreen } from "./auth-loading-screen"

/* ✅ DEV Tools */
import { DevWrapper } from "@/components/dev/dev-wrapper"
import { DevPanel } from "@/components/dev/dev-panel"

/* ✅ Pi Browser Required Screen */
import { PiBrowserRequired } from "@/components/pi-browser-required"

function AppContent({ children }: { children: ReactNode }) {
  const { isAuthenticated, userData } = usePiAuth()

  // ===============================
  // ✅ Detect Pi Browser
  // ===============================
  const isPiBrowser =
    typeof window !== "undefined" && (window as any).Pi !== undefined

  // ===============================
  // ✅ PRODUCTION MODE (Pi Browser Only)
  // ===============================
  if (process.env.NEXT_PUBLIC_APP_MODE === "prod") {
    // ❌ Kalau user buka bukan lewat Pi Browser
    if (!isPiBrowser) {
      return <PiBrowserRequired />
    }

    // 🔑 Kalau belum login Pi
    if (!isAuthenticated) {
      return <AuthLoadingScreen />
    }

    // ✅ Sudah login → masuk app
    return (
      <CoinProvider initialBalance={userData?.coin_balance || 0}>
        {children}
      </CoinProvider>
    )
  }

  // ===============================
  // ✅ DEV MODE (Chrome Testing Allowed)
  // ===============================
  if (!isAuthenticated) return <AuthLoadingScreen />

  return (
    <CoinProvider initialBalance={userData?.coin_balance || 999999}>
      <DevWrapper>
        {children}
        <DevPanel />
      </DevWrapper>
    </CoinProvider>
  )
}

export function AppWrapper({ children }: { children: ReactNode }) {
  return (
    <PiAuthProvider>
      <AppContent>{children}</AppContent>
    </PiAuthProvider>
  )
}
