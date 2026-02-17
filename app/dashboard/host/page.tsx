"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { usePiAuth } from "@/contexts/pi-auth-context"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins } from "lucide-react"

import { api } from "@/lib/api"
import { API_ROUTES } from "@/lib/api-routes"

import { CreateStreamDialog } from "@/components/create-stream-dialog"

export default function HostDashboardPage() {
  const { userData, isAuthenticated, authMessage } = usePiAuth()
  const router = useRouter()

  const [coinBalance, setCoinBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) return
    if (!userData) return

    if (userData.role !== "HOST") {
      router.push("/dashboard")
      return
    }

    const fetchCoins = async () => {
      setLoading(true)

      const res = await api.get(API_ROUTES.GET_USER_COINS(userData.id))

      if (res.data.success) {
        setCoinBalance(res.data.balance)
      }

      setLoading(false)
    }

    fetchCoins()
  }, [userData, isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>{authMessage}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Host Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Coin Balance: {coinBalance.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardContent />
      </Card>

      {/* ✅ CREATE STREAM */}
      <CreateStreamDialog />
    </div>
  )
}
