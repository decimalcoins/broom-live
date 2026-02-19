"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"

import {
  LiveKitRoom,
  VideoConference,
} from "@livekit/components-react"

export default function HostStreamPage() {
  const router = useRouter()
  const params = useParams()

  // ✅ FIX: ambil streamId dari useParams
  const streamId = params?.id as string

  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // ======================================================
  // ✅ FETCH HOST TOKEN
  // ======================================================
  useEffect(() => {
    if (!streamId) return

    async function startHost() {
      try {
        setLoading(true)
        setError(null)

        console.log("🎥 HOST STREAM ID:", streamId)

        const res = await fetch(
          `/api/streams/${streamId}/host-token`
        )

        const data = await res.json()

        console.log("🔑 HOST TOKEN RESPONSE:", data)

        if (!data.success) {
          throw new Error(data.error || "Token failed")
        }

        setToken(data.token)
      } catch (err: any) {
        console.error("❌ Host start error:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    startHost()
  }, [streamId])

  // ======================================================
  // UI STATES
  // ======================================================
  if (!streamId) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p className="text-red-500">
          ❌ Stream ID missing from URL
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p>🔑 Generating host token...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p className="text-red-500">❌ {error}</p>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p>❌ Token missing</p>
      </div>
    )
  }

  // ======================================================
  // ✅ LIVEKIT HOST ROOM
  // ======================================================
  return (
    <div className="h-screen relative">
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        connect={true}
        style={{ height: "100vh" }}
      >
        <VideoConference />

        {/* END STREAM BUTTON */}
        <button
          onClick={() => router.push("/dashboard/host")}
          className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-xl z-50"
        >
          End Stream
        </button>
      </LiveKitRoom>
    </div>
  )
}
