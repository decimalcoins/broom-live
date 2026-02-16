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

  // ============================
  // STATE
  // ============================
  const [coinBalance, setCoinBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)

  // ============================
  // ✅ ROLE GUARD + FETCH DATA
  // ============================
  useEffect(() => {
    if (!isAuthenticated) return
    if (!userData) return

    // ❌ bukan host → balik ke dashboard biasa
    if (userData.role !== "HOST") {
      router.push("/dashboard")
      return
    }

    fetchDashboardData()
  }, [isAuthenticated, userData])

  // ============================
  // FETCH DASHBOARD DATA
  // ============================
  const fetchDashboardData = async () => {
    if (!userData) return

    try {
      setLoading(true)

      // ============================
      // Fetch parallel
      // ============================
      const [coinsRes, txRes, wdRes] = await Promise.all([
        api.get<{ success: boolean; balance: number }>(
          API_ROUTES.GET_USER_COINS(userData.id)
        ),

        api.get<{ success: boolean; transactions: Transaction[] }>(
          API_ROUTES.GET_TRANSACTIONS(userData.id)
        ),

        api.get<{ success: boolean; withdrawals: Withdrawal[] }>(
          API_ROUTES.GET_WITHDRAWALS(userData.id)
        ),
      ])

      // ============================
      // Apply results
      // ============================
      if (coinsRes.data.success) {
        setCoinBalance(coinsRes.data.balance)
      }

      if (txRes.data.success) {
        setTransactions(txRes.data.transactions)
      }

      if (wdRes.data.success) {
        setWithdrawals(wdRes.data.withdrawals)
      }
    } catch (err) {
      console.error("❌ Host dashboard fetch failed:", err)
    } finally {
      setLoading(false)
    }
  }

  // ============================
  // AUTH LOADING SCREEN
  // ============================
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>{authMessage}</p>
      </div>
    )
  }

  // ============================
  // DASHBOARD LOADING
  // ============================
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

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          {/* BALANCE */}
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Coin Balance</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Coins className="w-6 h-6 text-yellow-500" />
                {coinBalance.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                ≈ {coinsToPi(coinBalance).toFixed(4)} Pi
              </p>
            </CardContent>
          </Card>

          {/* EARNINGS */}
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Earnings</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-500" />
                {totalEarnings.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Coins earned from gifts
              </p>
            </CardContent>
          </Card>

          {/* WITHDRAW */}
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Withdrawals</CardDescription>
              <CardTitle className="text-3xl">
                {pendingWithdrawals.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

          {/* GO LIVE */}
          <CreateStreamDialog
            onStreamCreated={(streamId) =>
              router.push(`/stream/${streamId}/host`)
            }
          />

          {/* WITHDRAW */}
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

          {/* TRANSACTIONS */}
          <TabsContent value="transactions" className="mt-4 space-y-3">
            {transactions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No transactions yet
                </CardContent>
              </Card>
            ) : (
              transactions.map((t) => (
                <Card key={t.id}>
                  <CardContent className="py-4 flex justify-between">
                    <div>
                      <p className="font-medium capitalize">
                        {t.type.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(t.created_at).toLocaleString()}
                      </p>
                    </div>
                    <p className="font-bold">
                      +{t.amount.toLocaleString()} {t.currency}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* WITHDRAWALS */}
          <TabsContent value="withdrawals" className="mt-4 space-y-3">
            {withdrawals.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No withdrawal requests yet
                </CardContent>
              </Card>
            ) : (
              withdrawals.map((w) => (
                <Card key={w.id}>
                  <CardContent className="py-4 flex justify-between">
                    <div>
                      <p className="font-medium">
                        {w.coin_amount.toLocaleString()} Coins
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(w.requested_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="font-bold">{w.status}</span>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
