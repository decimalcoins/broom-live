"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import { api, setApiAuthToken } from "@/lib/api"
import { BACKEND_URLS } from "@/lib/system-config"

interface PiAuthResult {
  accessToken: string
  user: {
    uid: string
    username: string
  }
}

declare global {
  interface Window {
    Pi?: {
      init: (config: { version: string; sandbox?: boolean }) => Promise<void>
      authenticate: (scopes: string[]) => Promise<PiAuthResult>
    }
  }
}

export interface LoginDTO {
  id: string
  uid: string
  username: string
  coin_balance: number
  role: string
}

interface PiAuthContextType {
  isAuthenticated: boolean
  authMessage: string
  userData: LoginDTO | null
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined)

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authMessage, setAuthMessage] = useState("Starting Pi Login...")
  const [userData, setUserData] = useState<LoginDTO | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        if (typeof window === "undefined") return

        // ===============================
        // ✅ Wait until Pi SDK injected
        // ===============================
        let attempts = 0
        while (!window.Pi && attempts < 15) {
          await new Promise((r) => setTimeout(r, 300))
          attempts++
        }

        if (!window.Pi) {
          throw new Error("Pi Browser not detected")
        }

        // ===============================
        // ✅ Init Pi SDK
        // ===============================
        setAuthMessage("Initializing Pi SDK...")

        await window.Pi.init({
          version: "2.0",
          sandbox: false,
        })

        // ===============================
        // ✅ Authenticate
        // ===============================
        setAuthMessage("Authenticating with Pi...")

        const auth = await window.Pi.authenticate(["username"])

        if (!auth?.accessToken) {
          throw new Error("Pi authentication failed")
        }

        // ===============================
        // ✅ Backend Login
        // ===============================
        setAuthMessage("Logging into backend...")

        const loginRes = await api.post(BACKEND_URLS.LOGIN, {
          pi_auth_token: auth.accessToken,
        })

        if (!loginRes.data?.user) {
          throw new Error("Backend login failed: no user returned")
        }

        // ===============================
        // ✅ Save token globally
        // ===============================
        setApiAuthToken(auth.accessToken)

        // ===============================
        // ✅ Save user session
        // ===============================
        setUserData(loginRes.data.user)
        setIsAuthenticated(true)

        setAuthMessage("Login Success 🎉")
      } catch (err: any) {
        console.error("❌ Pi Auth Error:", err)

        setAuthMessage(
          err.message ||
            "Authentication failed. Please open inside Pi Browser."
        )
      }
    }

    init()
  }, [])

  return (
    <PiAuthContext.Provider
      value={{
        isAuthenticated,
        authMessage,
        userData,
      }}
    >
      {children}
    </PiAuthContext.Provider>
  )
}

export function usePiAuth() {
  const ctx = useContext(PiAuthContext)
  if (!ctx) throw new Error("usePiAuth must be inside PiAuthProvider")
  return ctx
}
