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
    Pi?: any
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
  const [authMessage, setAuthMessage] = useState("Loading Pi SDK...")
  const [userData, setUserData] = useState<LoginDTO | null>(null)

  useEffect(() => {
    async function init() {
      try {
        if (typeof window === "undefined") return

        // ✅ Wait until Pi Browser injects window.Pi
        let tries = 0
        while (!window.Pi && tries < 20) {
          await new Promise((r) => setTimeout(r, 500))
          tries++
        }

        if (!window.Pi) {
          setAuthMessage("❌ Pi Browser not detected")
          return
        }

        setAuthMessage("Initializing Pi Network...")

        await window.Pi.init({
          version: "2.0",
          sandbox: false,
        })

        setAuthMessage("Authenticating with Pi...")

        const auth: PiAuthResult = await window.Pi.authenticate(["username"])

        setAuthMessage("Logging into backend...")

        const loginRes = await api.post(BACKEND_URLS.LOGIN, {
          pi_auth_token: auth.accessToken,
        })

        setApiAuthToken(auth.accessToken)

        setUserData(loginRes.data.user)
        setIsAuthenticated(true)

        setAuthMessage("✅ Login Success")
      } catch (err) {
        console.error("Pi Auth Error:", err)
        setAuthMessage("❌ Authentication failed")
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
