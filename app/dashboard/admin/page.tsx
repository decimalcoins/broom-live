"use client"

import { useEffect, useState } from "react"
import { usePiAuth } from "@/contexts/pi-auth-context"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { Settings, TrendingUp, AlertCircle } from "lucide-react"

import { api } from "@/lib/api"
import { API_ROUTES } from "@/lib/api-routes"

import type { Withdrawal, AppConfig } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useRouter } from "next/navigation"

export default function AdminDashboardPage() {
  const { userData, authMessage, isAuthenticated } = usePiAuth()
  const router = useRouter()

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [platformFee, setPlatformFee] = useState("")
  const [loading, setLoading] = useState(true)

  // ============================
  // ✅ ADMIN ROLE GUARD
  // ============================
  useEffect(() => {
    if (!isAuthenticated) return
    if (!userData) return

    if (userData.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }

    fetchAdminData()
  }, [userData, isAuthenticated])

  // ============================
  // Fetch Admin Data
  // ============================
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
      console.error("❌ Failed to fetch admin data:", err)
    } finally {
      setLoading(false)
    }
  }

  // ============================
  // Process Withdrawal
  // ============================
  const handleProcessWithdrawal = async (
    withdrawalId: string,
    approve: boolean,
    notes?: string
  ) => {
    try {
      await api.post(API_ROUTES.PROCESS_WITHDRAWAL(withdrawalId), {
        approve,
        admin_notes: notes,
      })

      await fetchAdminData()
    } catch (err) {
      console.error("❌ Failed to process withdrawal:", err)
      alert("Failed to process withdrawal")
    }
  }

  // ============================
  // Update Config
  // ============================
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
      console.error("❌ Failed to update config:", err)
      alert("Failed to update configuration")
    }
  }

  // ============================
  // Loading UI
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
        <p>Loading admin dashboard...</p>
      </div>
    )
  }

  // ============================
  // Stats
  // ============================
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending")

  const totalPendingCoins = pendingWithdrawals.reduce(
    (sum, w) => sum + w.coin_amount,
    0
  )

  const totalPendingPi = pendingWithdrawals.reduce(
    (sum, w) => sum + w.net_pi_amount,
    0
  )

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage platform settings and withdrawals
          </p>
        </div>

        {/* Stats */}
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
              <p className="text-sm text-muted-foreground">
                {totalPendingCoins.toLocaleString()} coins
              </p>
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

        {/* Tabs */}
        <Tabs defaultValue="withdrawals" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="withdrawals">
              Withdrawal Requests
            </TabsTrigger>
            <TabsTrigger value="settings">
              Platform Settings
            </TabsTrigger>
          </TabsList>

          {/* Withdrawals */}
          <TabsContent value="withdrawals" className="space-y-3 mt-4">
            {withdrawals.map((withdrawal) => (
              <Card key={withdrawal.id}>
                <CardContent className="py-4 space-y-3">
                  <div className="flex justify-between">
                    <p className="font-medium">
                      @{withdrawal.host_username}
                    </p>

                    <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500">
                      {withdrawal.status}
                    </span>
                  </div>

                  {withdrawal.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          handleProcessWithdrawal(withdrawal.id, true)
                        }
                      >
                        Approve
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() =>
                          handleProcessWithdrawal(
                            withdrawal.id,
                            false,
                            "Rejected"
                          )
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Configuration</CardTitle>
                <CardDescription>
                  Manage platform-wide settings
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <Label>Platform Fee Percentage</Label>

                <Input
                  value={platformFee}
                  onChange={(e) => setPlatformFee(e.target.value)}
                />

                <Button
                  onClick={handleUpdateConfig}
                  className="w-full"
                >
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
