"use client"

import { useEffect, useState } from "react"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Coins, TrendingUp } from "lucide-react"
import { api } from "@/lib/api"
import { API_ROUTES } from "@/lib/api-routes"
import type { Transaction, Withdrawal } from "@/lib/types"
import { coinsToPi } from "@/lib/constants"
import { useRouter } from "next/navigation"
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
  // ✅ HOST ROLE GUARD
  // ============================
  useEffect(() => {
    if (!isAuthenticated) return

    if (!userData) return

    // ❌ Jika bukan HOST → redirect
    if (userData.role !== "HOST") {
      router.push("/dashboard")
      return
    }

    // ✅ Kalau HOST → load dashboard
    fetchDashboardData()
  }, [userData, isAuthenticated])

  // ============================
  // Fetch Host Dashboard Data
  // ============================
  const fetchDashboardData = async () => {
    if (!userData) return

    try {
      const [coinsRes, transactionsRes, withdrawalsRes] = await Promise.all([
        api.get<{ balance: number }>(API_ROUTES.GET_USER_COINS(userData.id)),
        api.get<Transaction[]>(API_ROUTES.GET_TRANSACTIONS(userData.id)),
        api.get<Withdrawal[]>(API_ROUTES.GET_WITHDRAWALS(userData.id)),
      ])

      setCoinBalance(coinsRes.data.balance)
      setTransactions(transactionsRes.data)
      setWithdrawals(withdrawalsRes.data)
    } catch (err) {
      console.error("❌ Failed to fetch dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  // ============================
  // Loading Auth
  // ============================
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>{authMessage}</p>
      </div>
    )
  }

  // ============================
  // Loading Dashboard
  // ============================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading host dashboard...</p>
      </div>
    )
  }

  // ============================
  // Dashboard Stats
  // ============================
  const totalEarnings = transactions
    .filter((t) => t.type === "gift_received")
    .reduce((sum, t) => sum + t.amount, 0)

  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending")

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Host Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your streams and earnings
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <CreateStreamDialog
            onStreamCreated={(streamId) =>
              router.push(`/stream/${streamId}/host`)
            }
          />
          <WithdrawalRequestDialog
            coinBalance={coinBalance}
            onSuccess={fetchDashboardData}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          </TabsList>

          {/* Transactions */}
          <TabsContent value="transactions" className="space-y-3 mt-4">
            {transactions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No transactions yet
                </CardContent>
              </Card>
            ) : (
              transactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="py-4 flex justify-between">
                    <div>
                      <p className="font-medium capitalize">
                        {transaction.type.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleString()}
                      </p>
                    </div>
                    <p className="font-bold">
                      +{transaction.amount.toLocaleString()}{" "}
                      {transaction.currency}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Withdrawals */}
          <TabsContent value="withdrawals" className="space-y-3 mt-4">
            {withdrawals.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No withdrawal requests yet
                </CardContent>
              </Card>
            ) : (
              withdrawals.map((withdrawal) => (
                <Card key={withdrawal.id}>
                  <CardContent className="py-4 flex justify-between">
                    <div>
                      <p className="font-medium">
                        {withdrawal.coin_amount.toLocaleString()} Coins
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(withdrawal.requested_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="font-bold">{withdrawal.status}</span>
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
