"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import { usePiAuth } from "@/contexts/pi-auth-context"
import { api } from "@/lib/api"
import { API_ROUTES } from "@/lib/api-routes"

interface CoinContextType {
  balance: number
  setBalance: (val: number) => void
  addCoins: (amount: number) => void
  refreshBalance: () => Promise<void>
}

const CoinContext = createContext<CoinContextType | undefined>(undefined)

export function CoinProvider({ children }: { children: ReactNode }) {
  const { userData } = usePiAuth()

  const [balance, setBalance] = useState(0)

  // ==========================================
  // ✅ Fetch Balance from Backend (REAL SOURCE)
  // ==========================================
  const refreshBalance = async () => {
    if (!userData?.id) return

    try {
      const res = await api.get<{
        success: boolean
        balance: number
      }>(API_ROUTES.GET_USER_COINS(userData.id))

      if (res.data.success) {
        console.log("✅ Balance refreshed:", res.data.balance)
        setBalance(res.data.balance)
      }
    } catch (err) {
      console.error("❌ Failed refresh balance:", err)
    }
  }

  // ==========================================
  // ✅ AUTO REFRESH AFTER LOGIN
  // ==========================================
  useEffect(() => {
    if (!userData?.id) return
    refreshBalance()
  }, [userData?.id])

  // ==========================================
  // ✅ ADD COINS (Realtime UI)
  // ==========================================
  const addCoins = (amount: number) => {
    setBalance((prev) => prev + amount)
  }

  return (
    <CoinContext.Provider
      value={{
        balance,
        setBalance,
        addCoins,
        refreshBalance,
      }}
    >
      {children}
    </CoinContext.Provider>
  )
}

export function useCoins() {
  const ctx = useContext(CoinContext)
  if (!ctx) throw new Error("useCoins must be used inside CoinProvider")
  return ctx
}
