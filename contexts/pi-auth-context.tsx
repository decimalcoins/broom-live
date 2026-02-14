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
  login_order?: number
}

interface PiAuthContextType {
  isAuthenticated: boolean
  authMessage: string
  userData: LoginDTO | null

  reinitialize: () => void
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined)

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authMessage, setAuthMessage] = useState("Loading Pi SDK...")
  const [userData, setUserData] = useState<LoginDTO | null>(null)

  // ============================
  // ✅ MAIN INIT LOGIN FLOW
  // ============================
  async function init() {
    try {
      if (typeof window === "undefined") return

      setAuthMessage("Loading Pi SDK...")
      setIsAuthenticated(false)
      setUserData(null)

      // ============================
      // Wait Pi Browser inject
      // ============================
      let tries = 0
      while (!window.Pi && tries < 20) {
        await new Promise((r) => setTimeout(r, 500))
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
      // Pi Authenticate
      // ============================
      setAuthMessage("Authenticating with Pi...")

      const auth: PiAuthResult = await window.Pi.authenticate(["username"])

      // Save token globally
      setApiAuthToken(auth.accessToken)

      // ============================
      // Backend Login
      // ============================
      setAuthMessage("Logging into backend...")

      await api.post(BACKEND_URLS.LOGIN, {
        pi_auth_token: auth.accessToken,
      })

      // ============================
      // ✅ Fetch REAL user (/me)
      // Auto-host unlock happens here
      // ============================
      setAuthMessage("Loading user profile...")

      const meRes = await api.post(API_ROUTES.GET_ME, {
        uid: auth.user.uid,
      })

      if (!meRes.data.success) {
        throw new Error("Failed to load user")
      }

      // ============================
      // Save final userData
      // ============================
      setUserData(meRes.data.user)
      setIsAuthenticated(true)

      setAuthMessage("✅ Login Success")
    } catch (err) {
      console.error("Pi Auth Error:", err)
      setAuthMessage("❌ Authentication failed")
    }
  }

  // Auto Init
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

export function usePiAuth() {
  const ctx = useContext(PiAuthContext)
  if (!ctx) throw new Error("usePiAuth must be inside PiAuthProvider")
  return ctx
}
