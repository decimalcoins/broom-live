"use client"

import { useEffect, useState } from "react"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, TrendingUp, AlertCircle } from "lucide-react"
import { api } from "@/lib/api"
import { API_ROUTES } from "@/lib/api-routes"
import type { Withdrawal, AppConfig } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export default function AdminDashboardPage() {
  const { userData } = usePiAuth()
  const router = useRouter()
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [platformFee, setPlatformFee] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userData) {
      if (userData.role !== "admin") {
        router.push("/")
        return
      }
      fetchAdminData()
    }
  }, [userData, router])

  const fetchAdminData = async () => {
    try {
      const [withdrawalsRes, configRes] = await Promise.all([
        api.get<Withdrawal[]>(API_ROUTES.GET_ALL_WITHDRAWALS),
        api.get<AppConfig>(API_ROUTES.GET_CONFIG),
      ])

      setWithdrawals(withdrawalsRes.data)
      setConfig(configRes.data)
      setPlatformFee(configRes.data.platform_fee_percentage.toString())
    } catch (err) {
      console.error("[v0] Failed to fetch admin data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessWithdrawal = async (withdrawalId: string, approve: boolean, notes?: string) => {
    try {
      await api.post(API_ROUTES.PROCESS_WITHDRAWAL(withdrawalId), {
        approve,
        admin_notes: notes,
      })

      await fetchAdminData()
    } catch (err) {
      console.error("[v0] Failed to process withdrawal:", err)
      alert("Failed to process withdrawal")
    }
  }

  const handleUpdateConfig = async () => {
    const fee = Number.parseFloat(platformFee)
    if (isNaN(fee) || fee < 0 || fee > 100) {
      alert("Invalid platform fee percentage")
      return
    }

    try {
      await api.post(API_ROUTES.UPDATE_CONFIG, {
        platform_fee_percentage: fee,
      })

      await fetchAdminData()
      alert("Configuration updated successfully")
    } catch (err) {
      console.error("[v0] Failed to update config:", err)
      alert("Failed to update configuration")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading admin dashboard...</p>
      </div>
    )
  }

  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending")
  const totalPendingCoins = pendingWithdrawals.reduce((sum, w) => sum + w.coin_amount, 0)
  const totalPendingPi = pendingWithdrawals.reduce((sum, w) => sum + w.net_pi_amount, 0)

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage platform settings and withdrawals</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Withdrawals</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-yellow-500" />
                {pendingWithdrawals.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{totalPendingCoins.toLocaleString()} coins</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Pi Amount</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-500" />
                {totalPendingPi.toFixed(2)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Pi to be paid</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Platform Fee</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Settings className="w-6 h-6 text-blue-500" />
                {config?.platform_fee_percentage}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Current rate</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="withdrawals" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
            <TabsTrigger value="settings">Platform Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="withdrawals" className="space-y-3 mt-4">
            {withdrawals.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <p>No withdrawal requests</p>
                </CardContent>
              </Card>
            ) : (
              withdrawals.map((withdrawal) => (
                <Card key={withdrawal.id}>
                  <CardContent className="py-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">@{withdrawal.host_username}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(withdrawal.requested_at).toLocaleString()}
                          </p>
                        </div>
                        <span
                          className={`inline-block px-3 py-1 text-xs rounded-full ${
                            withdrawal.status === "approved"
                              ? "bg-green-500/20 text-green-500"
                              : withdrawal.status === "rejected"
                                ? "bg-red-500/20 text-red-500"
                                : "bg-yellow-500/20 text-yellow-500"
                          }`}
                        >
                          {withdrawal.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Coin Amount</p>
                          <p className="font-medium">{withdrawal.coin_amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Pi Value</p>
                          <p className="font-medium">{withdrawal.pi_amount.toFixed(4)} Pi</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Platform Fee</p>
                          <p className="font-medium text-red-500">
                            {withdrawal.platform_fee_percentage}% ({withdrawal.platform_fee_coins.toLocaleString()})
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Net Amount</p>
                          <p className="font-bold text-green-500">{withdrawal.net_pi_amount.toFixed(4)} Pi</p>
                        </div>
                      </div>

                      {withdrawal.admin_notes && (
                        <div className="rounded-lg bg-muted p-2">
                          <p className="text-xs text-muted-foreground">Admin Notes:</p>
                          <p className="text-sm">{withdrawal.admin_notes}</p>
                        </div>
                      )}

                      {withdrawal.status === "pending" && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleProcessWithdrawal(withdrawal.id, true)}
                            className="flex-1"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              const notes = prompt("Enter rejection reason (optional):")
                              handleProcessWithdrawal(withdrawal.id, false, notes || undefined)
                            }}
                            className="flex-1"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Configuration</CardTitle>
                <CardDescription>Manage platform-wide settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform-fee">Platform Fee Percentage</Label>
                  <Input
                    id="platform-fee"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={platformFee}
                    onChange={(e) => setPlatformFee(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Fee charged on host earnings before withdrawal (0-100%)
                  </p>
                </div>

                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pi to Coin Rate:</span>
                    <span className="font-medium">1 Pi = {config?.pi_to_coin_rate.toLocaleString()} Coins</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Coin to Gift Rate:</span>
                    <span className="font-medium">{config?.coin_to_gift_rate} Coins = 1 Gift Unit</span>
                  </div>
                </div>

                <Button onClick={handleUpdateConfig} size="lg" className="w-full">
                  Save Configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
