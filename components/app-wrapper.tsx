"use client"

import { useEffect, useState } from "react"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { PiBrowserRequired } from "@/components/pi-browser-required"
import { AuthLoadingScreen } from "@/components/auth-loading-screen"

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authMessage } = usePiAuth()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <AuthLoadingScreen message="Loading..." />
  }

  if (!(window as any).Pi) {
    return <PiBrowserRequired />
  }

  if (!isAuthenticated) {
    return <AuthLoadingScreen message={authMessage} />
  }

  return <>{children}</>
}
