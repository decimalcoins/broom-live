"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { usePiAuth } from "@/contexts/pi-auth-context"
import { CreateStreamDialog } from "@/components/create-stream-dialog"

import { api } from "@/lib/api"
import { API_ROUTES } from "@/lib/api-routes"

export default function HostDashboardPage() {
  const router = useRouter()
  const { userData } = usePiAuth()

  const [activeStreamId, setActiveStreamId] = useState<string | null>(null)

  // ============================================
  // ✅ Auto-check kalau host masih punya stream aktif
  // ============================================
  useEffect(() => {
    if (!userData?.id) return

    const checkActiveStream = async () => {
      try {
        const res = await api.get(API_ROUTES.GET_LIVE_STREAMS)

        if (!res.data.success) return

        const myStream = res.data.streams.find(
          (s: any) => s.host_id === userData.id
        )

        if (myStream) {
          console.log("✅ Active Stream Found:", myStream.id)
          setActiveStreamId(myStream.id)
        }
      } catch (err) {
        console.error("Active stream check error:", err)
      }
    }

    checkActiveStream()
  }, [userData?.id])

  // ============================================
  // ✅ Redirect kalau stream aktif ada
  // ============================================
  const handleGoLive = (streamId: string) => {
    console.log("🔥 Redirect to Host Stream:", streamId)

    router.push(`/stream/${streamId}/host`)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Host Dashboard</h1>

      {/* ✅ Jika stream masih aktif */}
      {activeStreamId && (
        <button
          className="w-full p-4 bg-red-600 text-white rounded-xl"
          onClick={() => router.push(`/stream/${activeStreamId}/host`)}
        >
          🔴 Resume Active Stream
        </button>
      )}

      {/* ✅ Tombol Create Stream */}
      <CreateStreamDialog onStreamCreated={handleGoLive} />
    </div>
  )
}
