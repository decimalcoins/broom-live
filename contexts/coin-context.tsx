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
  refreshBalance: () => void
  addCoins: (amount: number) => void
}

const CoinContext = createContext<CoinContextType | undefined>(undefined)

export function CoinProvider({ children }: { children: ReactNode }) {
  const { userData } = usePiAuth()
  const [balance, setBalance] = useState(0)

  // ✅ FETCH REAL BALANCE FROM DB
  const refreshBalance = async () => {
    if (!userData?.id) return

    try {
      const res = await api.get(
        API_ROUTES.GET_USER_COINS(userData.id)
      )

      if (res.data.success) {
        setBalance(res.data.balance)
      }
    } catch (err) {
      console.error("❌ Failed refresh balance:", err)
    }
  }

  // ✅ AUTO LOAD AFTER LOGIN
  useEffect(() => {
    if (userData?.id) {
      refreshBalance()
    }
  }, [userData])

  // ✅ REALTIME ADD
  const addCoins = (amount: number) => {
    setBalance((prev) => prev + amount)
  }

  return (
    <CoinContext.Provider value={{ balance, refreshBalance, addCoins }}>
      {children}
    </CoinContext.Provider>
  )
}

export function useCoins() {
  const ctx = useContext(CoinContext)
  if (!ctx) throw new Error("useCoins must be used inside CoinProvider")
  return ctx
}
