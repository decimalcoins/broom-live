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
  // FETCH HOST DASHBOARD DATA
  // ============================
  const fetchDashboardData = async () => {
    if (!userData) return

    // ✅ FIX: Always use uid OR id
    const userKey = userData.uid || userData.id

    if (!userKey) {
      console.error("❌ Missing user identifier:", userData)
      return
    }

    try {
      setLoading(true)

      console.log("✅ Fetching Host Dashboard for:", userKey)

      // ============================
      // COIN BALANCE
      // ============================
      const coinsRes = await api.get(API_ROUTES.GET_USER_COINS(userKey))

      console.log("Coin API Response:", coinsRes.data)

      if (coinsRes.data.success) {
        setCoinBalance(coinsRes.data.balance)
      }

      // ============================
      // TRANSACTIONS
      // ============================
      const transactionsRes = await api.get(
        API_ROUTES.GET_TRANSACTIONS(userKey)
      )

      if (transactionsRes.data.success) {
        setTransactions(transactionsRes.data.transactions)
      }

      // ============================
      // WITHDRAWALS
      // ============================
      const withdrawalsRes = await api.get(
        API_ROUTES.GET_WITHDRAWALS(userKey)
      )

      if (withdrawalsRes.data.success) {
        setWithdrawals(withdrawalsRes.data.withdrawals)
      }
    } catch (err) {
      console.error("❌ Failed to fetch host dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  // ============================
  // ROLE GUARD + INIT FETCH
  // ============================
  useEffect(() => {
    if (!isAuthenticated) return
    if (!userData) return

    console.log("✅ USER DATA FULL:", userData)

    // Only HOST allowed
    if (userData.role !== "HOST") {
      router.push("/dashboard")
      return
    }

    fetchDashboardData()
  }, [userData, isAuthenticated])

  // ============================
  // LOADING AUTH STATE
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
  // STATS CALCULATION
  // ============================
  const totalEarnings = transactions
    .filter((t) => t.type === "gift_received")
    .reduce((sum, t) => sum + t.amount, 0)

  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending")

  // ============================
  // UI RENDER
  // ============================
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Host Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your streams and earnings
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Balance */}
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Coin Balance</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Coins className="w-6 h-6" />
                {coinBalance.toLocaleString()}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground">
                ≈ {coinsToPi(coinBalance).toFixed(4)} Pi
              </p>
            </CardContent>
          </Card>

          {/* Earnings */}
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Earnings</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                {totalEarnings.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Pending Withdrawals */}
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Withdrawals</CardDescription>
              <CardTitle className="text-3xl">
                {pendingWithdrawals.length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <CreateStreamDialog
            onStreamCreated={(streamId) => router.push(`/stream/${streamId}`)}
          />

          <WithdrawalRequestDialog
            coinBalance={coinBalance}
            onSuccess={fetchDashboardData}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="transactions">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          </TabsList>

          {/* Transactions */}
          <TabsContent value="transactions">
            {transactions.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">
                No transactions yet
              </p>
            ) : (
              transactions.map((t) => (
                <p key={t.id}>
                  {t.type} — {t.amount.toLocaleString()} coins
                </p>
              ))
            )}
          </TabsContent>

          {/* Withdrawals */}
          <TabsContent value="withdrawals">
            {withdrawals.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">
                No withdrawals yet
              </p>
            ) : (
              withdrawals.map((w) => (
                <p key={w.id}>
                  {w.amount.toLocaleString()} coins — {w.status}
                </p>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
