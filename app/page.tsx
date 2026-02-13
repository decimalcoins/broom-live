"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { usePiAuth } from "@/contexts/pi-auth-context"

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

  const isDev = process.env.NEXT_PUBLIC_APP_MODE === "dev"

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
      // ============================
      // ✅ DEV MODE → Mock Streams
      // ============================
      if (isDev) {
        console.warn("⚡ DEV MODE: Using mock live streams")

        setLiveStreams([
          {
            id: "mock-stream-1",
            title: "DEV Stream Testing 🎥",
            description: "This is a simulated stream for UI testing",
            host_id: "dev-host",
            host_username: "Developer",
            viewer_count: 12,
            thumbnail_url: "",
            is_live: true,
          },
          {
            id: "mock-stream-2",
            title: "Broom Live Demo 🚀",
            description: "Mock stream for Pi Browser preparation",
            host_id: "dev-host2",
            host_username: "BroomHost",
            viewer_count: 7,
            thumbnail_url: "",
            is_live: true,
          },
        ] as any)

        setLoading(false)
        return
      }

      // ============================
      // ✅ PROD MODE → Backend Streams
      // ============================
      const response = await api.get<Stream[]>(
        `${API_ROUTES.GET_STREAMS}?is_live=true`
      )

      setLiveStreams(response.data)
    } catch (err) {
      console.error("❌ Failed to fetch streams:", err)
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
            <CoinBalance balance={userData?.coin_balance || 0} />

            {userData?.role === "host" && (
              <Button
                onClick={() => router.push("/dashboard/host")}
                variant="outline"
              >
                Dashboard
              </Button>
            )}

            {userData?.role === "admin" && (
              <Button
                onClick={() => router.push("/dashboard/admin")}
                variant="outline"
              >
                Admin
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

            {/* DEV Badge */}
            {isDev && (
              <p className="text-xs text-yellow-500 mt-1">
                ⚡ DEV MODE: Streams are simulated
              </p>
            )}
          </div>

          <BuyCoinsDialog onSuccess={() => window.location.reload()} />
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

              {userData?.role === "host" && (
                <Button onClick={() => router.push("/dashboard/host")}>
                  Go to Dashboard
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