"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import { PI_NETWORK_CONFIG, BACKEND_URLS } from "@/lib/system-config"
import { api, setApiAuthToken } from "@/lib/api"

interface PiAuthResult {
  accessToken: string
  user: {
    uid: string
    username: string
  }
}

declare global {
  interface Window {
    Pi: {
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

// ============================
// Load Pi SDK
// ============================
function loadPiSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = PI_NETWORK_CONFIG.SDK_URL
    script.async = true

    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Failed to load Pi SDK"))

    document.head.appendChild(script)
  })
}

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authMessage, setAuthMessage] = useState("Initializing Pi...")
  const [userData, setUserData] = useState<LoginDTO | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        if (typeof window === "undefined") return

        // Must be Pi Browser
        if (!window.Pi) {
          setAuthMessage("Loading Pi SDK...")
          await loadPiSDK()
        }

        if (!window.Pi) {
          throw new Error("Pi Browser required")
        }

        setAuthMessage("Initializing Pi Network...")

        await window.Pi.init({
          version: "2.0",
          sandbox: false,
        })

        setAuthMessage("Authenticating with Pi...")

        const auth = await window.Pi.authenticate(["username"])

        setAuthMessage("Logging into backend...")

        const loginRes = await api.post<LoginDTO>(BACKEND_URLS.LOGIN, {
          pi_auth_token: auth.accessToken,
        })

        // Save token for API requests
        setApiAuthToken(auth.accessToken)

        setUserData(loginRes.data)
        setIsAuthenticated(true)

        setAuthMessage("Login Success 🎉")
      } catch (err) {
        console.error("❌ Pi Auth Error:", err)
        setAuthMessage("Authentication failed. Please open in Pi Browser.")
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
