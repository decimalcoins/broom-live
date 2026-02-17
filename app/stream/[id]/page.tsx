"use client"

import { useEffect, useState } from "react"

import { StreamWithChat } from "@/components/stream-with-chat"
import { StreamSplash } from "@/components/stream-splash"

import { api } from "@/lib/api"
import { API_ROUTES } from "@/lib/api-routes"
import type { Stream } from "@/lib/types"

export default function StreamPage({
  params,
}: {
  params: { id: string }
}) {
  const streamId = params.id

  const [stream, setStream] = useState<Stream | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ============================
  // ✅ FETCH STREAM DETAIL
  // ============================
  useEffect(() => {
    const fetchStream = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await api.get(API_ROUTES.GET_STREAM(streamId))

        console.log("🎥 STREAM DETAIL RESPONSE:", res.data)

        if (!res.data.success) {
          throw new Error(res.data.error || "Stream not found")
        }

        const streamData = res.data.stream

        // ✅ CHECK STREAM LIVE STATUS
        if (!streamData.is_live) {
          throw new Error("Stream is offline")
        }

        setStream(streamData)
      } catch (err: any) {
        console.error("❌ STREAM FETCH ERROR:", err)
        setError(err.message)
        setStream(null)
      } finally {
        setLoading(false)
      }
    }

    fetchStream()
  }, [streamId])

  // ============================
  // UI STATES
  // ============================
  if (loading) {
    return <StreamSplash label="Joining Stream..." />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p className="text-red-500">❌ {error}</p>
      </div>
    )
  }

  if (!stream) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p>❌ Stream not found</p>
      </div>
    )
  }

  // ============================
  // ✅ STREAM FOUND + LIVE
  // ============================
  return <StreamWithChat stream={stream} />
}
