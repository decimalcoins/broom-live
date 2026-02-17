"use client"

import Link from "next/link"
import UnlockHostButton from "@/components/UnlockHostButton"
import { usePiAuth } from "@/contexts/pi-auth-context"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function DashboardPage() {
  const { userData, authMessage, isAuthenticated } = usePiAuth()

  if (!isAuthenticated || !userData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>{authMessage}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <Card>
          <CardHeader>
            <CardTitle>Your Account</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <b>User:</b> {userData.username}
            </p>
            <p>
              <b>Role:</b> {userData.role}
            </p>
            <p>
              <b>Coins:</b> {userData.coin_balance.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* HOST Access */}
        {userData.role === "HOST" ? (
          <Card>
            <CardHeader>
              <CardTitle>🎥 Host Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p>You are a HOST. Start streaming now!</p>
              <Link
                href="/dashboard/host"
                className="inline-block mt-3 px-4 py-2 bg-black text-white rounded-xl"
              >
                Go to Host Dashboard
              </Link>
            </CardContent>
          </Card>
        ) : userData.login_order > 100 ? (
          <Card>
            <CardHeader>
              <CardTitle>Unlock Host Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>Pay 1 Pi to unlock HOST + get 50,000 coins.</p>
              <UnlockHostButton userId={userData.id} />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>🎁 Pioneer Bonus</CardTitle>
            </CardHeader>
            <CardContent>
              <p>You are an early pioneer. HOST access is free!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
