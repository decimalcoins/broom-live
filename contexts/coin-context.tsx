"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface CoinContextType {
  balance: number
  setBalance: (val: number) => void
  addCoins: (amount: number) => void
}

const CoinContext = createContext<CoinContextType | undefined>(undefined)

export function CoinProvider({
  children,
  initialBalance = 0,
}: {
  children: ReactNode
  initialBalance?: number
}) {
  const [balance, setBalance] = useState(initialBalance)

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