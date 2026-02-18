"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import { api, setApiAuthToken } from "@/lib/api"
import { API_ROUTES } from "@/lib/api-routes"

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

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authMessage, setAuthMessage] = useState("Loading Pi SDK...")
  const [userData, setUserData] = useState<LoginDTO | null>(null)

  async function init() {
    try {
      setAuthMessage("Loading Pi SDK...")
      setIsAuthenticated(false)
      setUserData(null)

      // ✅ Wait Pi Inject
      let tries = 0
      while (!window.Pi && tries < 20) {
        await new Promise((r) => setTimeout(r, 300))
        tries++
      }

      if (!window.Pi) {
        setAuthMessage("❌ Pi Browser not detected")
        return
      }

      // ✅ Init Pi SDK Production
      await window.Pi.init({
        version: "2.0",
        sandbox: false,
      })

      setAuthMessage("Authenticating with Pi...")

      // ✅ FIX Scope
      const auth: PiAuthResult = await window.Pi.authenticate([
        "username",
        "payments",
      ])

      if (!auth?.accessToken) {
        throw new Error("Pi did not return accessToken")
      }

      // ✅ Save token globally
      setApiAuthToken(auth.accessToken)

      setAuthMessage("Loading user profile...")

      // ✅ Backend /me
      const meRes = await api.post(API_ROUTES.GET_ME, {
        pi_auth_token: auth.accessToken,
      })

      if (!meRes.data.success) {
        throw new Error(meRes.data.error)
      }

      setUserData(meRes.data.user)
      setIsAuthenticated(true)

      setAuthMessage("✅ Login success!")
    } catch (err: any) {
      console.error("Pi Auth Error:", err)

      setAuthMessage(
        "❌ Authentication failed: " +
          (err?.message || JSON.stringify(err))
      )
    }
  }

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
