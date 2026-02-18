"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import { useRouter, usePathname } from "next/navigation"

import { api, setApiAuthToken } from "@/lib/api"
import { API_ROUTES } from "@/lib/api-routes"

// ============================
// Types
// ============================
interface PiAuthResult {
  accessToken: string
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
  reinitialize: () => void
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined)

// ============================
// Provider
// ============================
export function PiAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authMessage, setAuthMessage] = useState("Loading Pi SDK...")
  const [userData, setUserData] = useState<LoginDTO | null>(null)

  // ============================
  // MAIN AUTH FLOW
  // ============================
  async function init() {
    try {
      if (typeof window === "undefined") return

      // Reset state
      setAuthMessage("Loading Pi SDK...")
      setIsAuthenticated(false)
      setUserData(null)

      // ============================
      // Wait Pi SDK Inject
      // ============================
      let tries = 0
      while (!window.Pi && tries < 25) {
        await new Promise((r) => setTimeout(r, 300))
        tries++
      }

      if (!window.Pi) {
        setAuthMessage("❌ Please open inside Pi Browser")
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
      // Authenticate Pioneer
      // ============================
      setAuthMessage("Authenticating with Pi...")

      const auth: PiAuthResult = await window.Pi.authenticate(["username"])

      if (!auth?.accessToken) {
        throw new Error("No access token returned from Pi")
      }

      // Save token globally
      setApiAuthToken(auth.accessToken)

      // ============================
      // Load Profile from Backend
      // (/me assigns tier bonus)
      // ============================
      setAuthMessage("Loading user profile...")

      const meRes = await api.post(API_ROUTES.GET_ME, {
        pi_auth_token: auth.accessToken,
      })

      if (!meRes.data.success) {
        throw new Error(meRes.data.error || "Failed to load profile")
      }

      const freshUser: LoginDTO = meRes.data.user

      // Save state
      setUserData(freshUser)
      setIsAuthenticated(true)

      // Bonus message
      if (meRes.data.bonus_awarded > 0) {
        setAuthMessage(
          `🎉 Welcome ${freshUser.username}! Bonus +${meRes.data.bonus_awarded} Coins!`
        )
      } else {
        setAuthMessage(`✅ Welcome back, ${freshUser.username}`)
      }

      // ============================================
      // ✅ AUTO REDIRECT BASED ON ROLE
      // ============================================
      setTimeout(() => {
        if (freshUser.role === "HOST") {
          if (!pathname.startsWith("/dashboard/host")) {
            router.push("/dashboard/host")
          }
        } else {
          if (!pathname.startsWith("/dashboard")) {
            router.push("/dashboard")
          }
        }
      }, 500)
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

// ============================
// Hook
// ============================
export function usePiAuth() {
  const ctx = useContext(PiAuthContext)
  if (!ctx) throw new Error("usePiAuth must be inside PiAuthProvider")
  return ctx
}
