"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { usePiAuth } from "@/contexts/pi-auth-context"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Coins, TrendingUp } from "lucide-react"

import { api } from "@/lib/api"
import { API_ROUTES } from "@/lib/api-routes"

import type { Transaction, Withdrawal } from "@/lib/types"
import { coinsToPi } from "@/lib/constants"

import { CreateStreamDialog } from "@/components/create-stream-dialog"
import { WithdrawalRequestDialog } from "@/components/withdrawal-request-dialog"

export default function HostDashboardPage() {
  const { userData, authMessage, isAuthenticated } = usePiAuth()
  const router = useRouter()

  const [coinBalance, setCoinBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)

  // ============================
  // ✅ FETCH DASHBOARD
  // ============================
  const fetchDashboardData = async () => {
    if (!userData) return

    try {
      setLoading(true)

      // ✅ Coins API
      const coinsRes = await api.get<{
        success: boolean
        balance: number
      }>(API_ROUTES.GET_USER_COINS(userData.id))

      if (coinsRes.data.success) {
        setCoinBalance(coinsRes.data.balance)
      }

      // ✅ Transactions API
      const txRes = await api.get<{
        success: boolean
        transactions: Transaction[]
      }>(API_ROUTES.GET_TRANSACTIONS(userData.id))

      if (txRes.data.success) {
        setTransactions(txRes.data.transactions)
      }

      // ✅ Withdrawals API
      const wdRes = await api.get<{
        success: boolean
        withdrawals: Withdrawal[]
      }>(API_ROUTES.GET_WITHDRAWALS(userData.id))

      if (wdRes.data.success) {
        setWithdrawals(wdRes.data.withdrawals)
      }
    } catch (err) {
      console.error("❌ Host dashboard error:", err)
    } finally {
      setLoading(false)
    }
  }

  // ============================
  // ✅ ROLE GUARD
  // ============================
  useEffect(() => {
    if (!isAuthenticated) return
    if (!userData) return

    if (userData.role !== "HOST") {
      router.push("/dashboard")
      return
    }

    fetchDashboardData()
  }, [userData, isAuthenticated])

  // ============================
  // UI STATES
  // ============================
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>{authMessage}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading host dashboard...</p>
      </div>
    )
  }

  // ============================
  // STATS
  // ============================
  const totalEarnings = transactions
    .filter((t) => t.type === "gift_received")
    .reduce((sum, t) => sum + t.amount, 0)

  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending")

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">

        <h1 className="text-3xl font-bold mb-2">Host Dashboard</h1>
        <p className="text-muted-foreground mb-6">
          Manage your streams and earnings
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          {/* Balance */}
          <Card>
            <CardHeader>
              <CardDescription>Coin Balance</CardDescription>
              <CardTitle className="text-3xl flex gap-2 items-center">
                <Coins className="w-6 h-6" />
                {coinBalance.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              ≈ {coinsToPi(coinBalance).toFixed(4)} Pi
            </CardContent>
          </Card>

          {/* Earnings */}
          <Card>
            <CardHeader>
              <CardDescription>Total Earnings</CardDescription>
              <CardTitle className="text-3xl flex gap-2 items-center">
                <TrendingUp className="w-6 h-6" />
                {totalEarnings.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>Coins earned from gifts</CardContent>
          </Card>

          {/* Pending */}
          <Card>
            <CardHeader>
              <CardDescription>Pending Withdrawals</CardDescription>
              <CardTitle className="text-3xl">
                {pendingWithdrawals.length}
              </CardTitle>
            </CardHeader>
            <CardContent>Awaiting approval</CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <CreateStreamDialog
            onStreamCreated={(id) => router.push(`/stream/${id}/host`)}
          />

          <WithdrawalRequestDialog
            coinBalance={coinBalance}
            onSuccess={fetchDashboardData}
          />
        </div>
      </div>
    </div>
  )
}
