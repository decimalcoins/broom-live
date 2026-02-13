"use client"

import type { ReactNode } from "react"
import { PiAuthProvider, usePiAuth } from "@/contexts/pi-auth-context"
import { AuthLoadingScreen } from "./auth-loading-screen"
import { PiBrowserRequired } from "./pi-browser-required"

function AppContent({ children }: { children: ReactNode }) {
  const { isAuthenticated } = usePiAuth()

  if (!window?.Pi) {
    return <PiBrowserRequired />
  }

  if (!isAuthenticated) {
    return <AuthLoadingScreen />
  }

  return <>{children}</>
}

export function AppWrapper({ children }: { children: ReactNode }) {
  return (
    <PiAuthProvider>
      <AppContent>{children}</AppContent>
    </PiAuthProvider>
  )
}
