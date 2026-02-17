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
  const [error, setError] = useState<string | null>(null)

  // ============================
  // FETCH HOST DASHBOARD DATA
  // ============================
  const fetchDashboardData = async () => {
    if (!userData?.id) return

    try {
      setLoading(true)
      setError(null)

      // ✅ COIN BALANCE
      const coinsRes = await api.get(
        API_ROUTES.GET_USER_COINS(userData.id)
      )

      if (coinsRes.data.success) {
        setCoinBalance(coinsRes.data.balance)
      }

      // ✅ TRANSACTIONS (optional)
      try {
        const txRes = await api.get(
          API_ROUTES.GET_TRANSACTIONS(userData.id)
        )

        if (txRes.data.success) {
          setTransactions(txRes.data.transactions || [])
        }
      } catch {
        console.warn("Transactions ignored")
      }

      // ✅ WITHDRAWALS (optional)
      try {
        const wdRes = await api.get(
          API_ROUTES.GET_WITHDRAWALS(userData.id)
        )

        if (wdRes.data.success) {
          setWithdrawals(wdRes.data.withdrawals || [])
        }
      } catch {
        console.warn("Withdrawals ignored")
      }
    } catch (err: any) {
      console.error("❌ HOST DASHBOARD ERROR:", err)
      setError(err?.message || "Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }

  // ============================
  // ROLE GUARD
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
  // AUTH STATE
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

  const pendingWithdrawals = withdrawals.filter(
    (w) => w.status === "pending"
  )

  // ============================
  // UI
  // ============================
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Host Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your streams and earnings
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <Card className="mb-6 border-red-500">
            <CardHeader>
              <CardTitle className="text-red-600">
                ⚠ Dashboard Error
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-red-500">
              {error}
            </CardContent>
          </Card>
        )}

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Earnings</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                {totalEarnings.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Withdrawals</CardDescription>
              <CardTitle className="text-3xl">
                {pendingWithdrawals.length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* ✅ FIX HOST REDIRECT */}
          <CreateStreamDialog
            onStreamCreated={(streamId) => {
              router.push(`/stream/${streamId}/host`)
            }}
          />

          <WithdrawalRequestDialog
            coinBalance={coinBalance}
            onSuccess={fetchDashboardData}
          />
        </div>

        {/* TABS */}
        <Tabs defaultValue="transactions">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            {transactions.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">
                No transactions yet
              </p>
            ) : (
              transactions.map((t) => <p key={t.id}>{t.type}</p>)
            )}
          </TabsContent>

          <TabsContent value="withdrawals">
            {withdrawals.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">
                No withdrawals yet
              </p>
            ) : (
              withdrawals.map((w) => <p key={w.id}>{w.status}</p>)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
