"use client"

import type { ReactNode } from "react"
import { PiAuthProvider, usePiAuth } from "@/contexts/pi-auth-context"
import { AuthLoadingScreen } from "@/components/auth-loading-screen"

function AppContent({ children }: { children: ReactNode }) {
  const { isAuthenticated, authMessage } = usePiAuth()

  /**
   * ✅ Splash Loading Screen
   * muncul sebelum userData siap
   */
  if (!isAuthenticated) {
    return <AuthLoadingScreen message={authMessage} />
  }

  /**
   * ✅ App Ready
   */
  return <>{children}</>
}

export function AppWrapper({ children }: { children: ReactNode }) {
  return (
    <PiAuthProvider>
      <AppContent>{children}</AppContent>
    </PiAuthProvider>
  )
}
