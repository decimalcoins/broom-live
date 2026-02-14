"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import { usePiAuth } from "@/contexts/pi-auth-context"

interface CoinContextType {
  balance: number
  setBalance: (val: number) => void
  addCoins: (amount: number) => void
}

const CoinContext = createContext<CoinContextType | undefined>(undefined)

export function CoinProvider({ children }: { children: ReactNode }) {
  const { userData } = usePiAuth()

  const [balance, setBalance] = useState(0)

  // ==========================================
  // ✅ AUTO SYNC COIN BALANCE AFTER LOGIN
  // ==========================================
  useEffect(() => {
    if (userData?.coin_balance !== undefined) {
      console.log("✅ Sync coin balance from user:", userData.coin_balance)
      setBalance(userData.coin_balance)
    }
  }, [userData])

  // ==========================================
  // ✅ ADD COINS (Realtime Gift Reward)
  // ==========================================
  const addCoins = (amount: number) => {
    setBalance((prev) => prev + amount)
  }

  return (
    <CoinContext.Provider value={{ balance, setBalance, addCoins }}>
      {children}
    </CoinContext.Provider>
  )
}

export function useCoins() {
  const ctx = useContext(CoinContext)
  if (!ctx) throw new Error("useCoins must be used inside CoinProvider")
  return ctx
}
