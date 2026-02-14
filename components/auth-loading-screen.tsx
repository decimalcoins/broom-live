"use client"

import Image from "next/image"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { Button } from "@/components/ui/button"

interface AuthLoadingScreenProps {
  message?: string
}

export function AuthLoadingScreen({ message }: AuthLoadingScreenProps) {
  const { authMessage, reinitialize } = usePiAuth()

  const finalMessage = message || authMessage

  const isError =
    finalMessage.toLowerCase().includes("failed") ||
    finalMessage.toLowerCase().includes("error") ||
    finalMessage.toLowerCase().includes("not detected")

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <div className="max-w-md w-full px-6 text-center space-y-6">
        
        {/* ✅ LOGO */}
        <div className="flex justify-center animate-fade-in">
          <Image
            src="/logo.png"
            alt="Broom Live"
            width={180}
            height={180}
            priority
          />
        </div>

        {/* ✅ SPINNER */}
        {!isError && (
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
          </div>
        )}

        {/* ✅ MESSAGE */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">
            {isError ? "Authentication Failed" : "Connecting to Pi Network..."}
          </h2>

          <p
            className={`text-sm ${
              isError ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {finalMessage}
          </p>
        </div>

        {/* ✅ RETRY */}
        {isError && (
          <Button onClick={reinitialize} className="w-full">
            Try Again
          </Button>
        )}
      </div>
    </div>
  )
}
