"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { usePiAuth } from "@/contexts/pi-auth-context"
import { useCoins } from "@/contexts/coin-context"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { Video, Users } from "lucide-react"

import { api } from "@/lib/api"
import { API_ROUTES } from "@/lib/api-routes"

import type { Stream } from "@/lib/types"

import { CoinBalance } from "@/components/coin-balance"
import { BuyCoinsDialog } from "@/components/buy-coins-dialog"

export default function HomePage() {
  const router = useRouter()
  const { userData } = usePiAuth()
  const { balance } = useCoins()

  const [liveStreams, setLiveStreams] = useState<Stream[]>([])
  const [loading, setLoading] = useState(true)

  // ============================
  // Load Live Streams
  // ============================
  useEffect(() => {
    fetchLiveStreams()
  }, [])

  const fetchLiveStreams = async () => {
    setLoading(true)

    try {
      // ✅ FIX: Use LIVE_STREAMS endpoint
      const res = await api.get(API_ROUTES.LIVE_STREAMS)

      if (res.data.success) {
        setLiveStreams(res.data.streams)
      } else {
        setLiveStreams([])
      }
    } catch (err) {
      console.error("❌ Failed to fetch live streams:", err)
      setLiveStreams([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Video className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">BROOM LIVE</h1>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Coin Balance */}
            <CoinBalance balance={balance} />

            {/* Host Dashboard */}
            {userData?.role === "HOST" && (
              <Button
                onClick={() => router.push("/dashboard/host")}
                variant="outline"
              >
                Dashboard
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="container mx-auto px-4 py-8">
        {/* Top Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Live Now</h2>
            <p className="text-muted-foreground">
              Watch and interact with live streams
            </p>
          </div>

          <BuyCoinsDialog onSuccess={() => fetchLiveStreams()} />
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="text-center py-12">
            <p>Loading streams...</p>
          </div>
        ) : liveStreams.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                No Live Streams
              </h3>
              <p className="text-muted-foreground mb-4">
                Check back later or start your own stream!
              </p>

              {userData?.role === "HOST" && (
                <Button onClick={() => router.push("/dashboard/host")}>
                  Go Live Now
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveStreams.map((stream) => (
              <Card
                key={stream.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/stream/${stream.id}`)}
              >
                <CardHeader className="relative p-0">
                  {/* Thumbnail */}
                  <div className="aspect-video bg-muted flex items-center justify-center rounded-t-lg">
                    <Video className="w-16 h-16 text-muted-foreground" />
                  </div>

                  {/* LIVE Badge */}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                    LIVE
                  </div>

                  {/* Viewer Count */}
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {stream.viewer_count}
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-1">
                    {stream.title}
                  </CardTitle>

                  <CardDescription className="text-sm">
                    @{stream.host_username}
                  </CardDescription>

                  {stream.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {stream.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
