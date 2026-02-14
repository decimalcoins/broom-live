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
import { API_ROUTES } from "@/lib/api-routes"

// ============================
// Types
// ============================
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
  login_order: number
}

interface PiAuthContextType {
  isAuthenticated: boolean
  authMessage: string
  userData: LoginDTO | null

  // Retry Support
  reinitialize: () => void
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined)

// ============================
// Provider
// ============================
export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authMessage, setAuthMessage] = useState("Loading Pi SDK...")
  const [userData, setUserData] = useState<LoginDTO | null>(null)

  // ============================
  // MAIN LOGIN FLOW
  // ============================
  async function init() {
    try {
      if (typeof window === "undefined") return

      // Reset State
      setAuthMessage("Loading Pi SDK...")
      setIsAuthenticated(false)
      setUserData(null)

      // ============================
      // Wait until Pi Browser injects SDK
      // ============================
      let tries = 0
      while (!window.Pi && tries < 20) {
        await new Promise((r) => setTimeout(r, 400))
        tries++
      }

      if (!window.Pi) {
        setAuthMessage("❌ Pi Browser not detected")
        return
      }

      // ============================
      // Init Pi SDK
      // ============================
      setAuthMessage("Initializing Pi Network...")

      await window.Pi.init({
        version: "2.0",
        sandbox: false,
      })

      // ============================
      // Authenticate Pi User
      // ============================
      setAuthMessage("Authenticating with Pi...")

      const auth: PiAuthResult = await window.Pi.authenticate(["username"])

      // Save Token Globally
      setApiAuthToken(auth.accessToken)

      // ============================
      // Backend Login (Token Verify Only)
      // ============================
      setAuthMessage("Verifying login token...")

      await api.post(BACKEND_URLS.LOGIN, {
        pi_auth_token: auth.accessToken,
      })

      // ============================
      // Fetch REAL user (/me)
      // BONUS + ROLE AUTO HOST happens here
      // ============================
      setAuthMessage("Loading user profile...")

      const meRes = await api.post(API_ROUTES.GET_ME, {
        uid: auth.user.uid,
        username: auth.user.username,
      })

      if (!meRes.data.success) {
        throw new Error(meRes.data.error || "Failed to load user profile")
      }

      // ============================
      // Save Final UserData
      // ============================
      setUserData(meRes.data.user)
      setIsAuthenticated(true)

      // Show Bonus Info
      if (meRes.data.bonus_awarded > 0) {
        setAuthMessage(
          `🎉 Bonus +${meRes.data.bonus_awarded} Coins Received!`
        )
      } else {
        setAuthMessage("✅ Login Success")
      }
    } catch (err) {
      console.error("Pi Auth Error:", err)
      setAuthMessage("❌ Authentication failed")
    }
  }

  // ============================
  // Auto Init Once
  // ============================
  useEffect(() => {
    init()
  }, [])

  return (
    <PiAuthContext.Provider
      value={{
        isAuthenticated,
        authMessage,
        userData,
        reinitialize: init,
      }}
    >
      {children}
    </PiAuthContext.Provider>
  )
}

// ============================
// Hook
// ============================
export function usePiAuth() {
  const ctx = useContext(PiAuthContext)
  if (!ctx) throw new Error("usePiAuth must be inside PiAuthProvider")
  return ctx
}
