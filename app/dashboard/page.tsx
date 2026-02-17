"use client"

import Link from "next/link"
import UnlockHostButton from "@/components/UnlockHostButton"
import { usePiAuth } from "@/contexts/pi-auth-context"

import { AuthLoadingScreen } from "@/components/auth-loading-screen"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function DashboardPage() {
  const { userData, authMessage, isAuthenticated } = usePiAuth()

  // ✅ Loading / Auth Guard
  if (!isAuthenticated || !userData) {
    return <AuthLoadingScreen message={authMessage || "Loading dashboard..."} />
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {userData.username}
          </p>
        </div>

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle>Your Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <b>Role:</b> {userData.role}
            </p>
            <p>
              <b>Coin Balance:</b>{" "}
              {userData.coin_balance.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* Host Access */}
        {userData.role === "HOST" ? (
          <Card>
            <CardHeader>
              <CardTitle>🎥 Host Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>You are a HOST. You can start live streams now!</p>

              <Link
                href="/dashboard/host"
                className="inline-block px-4 py-2 rounded-xl bg-black text-white"
              >
                Go to Host Dashboard
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Unlock Host Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                You are currently a viewer. Unlock host access by paying{" "}
                <b>1 Pi</b> and receive <b>50,000 Coins</b>.
              </p>

              <UnlockHostButton userId={userData.id} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
