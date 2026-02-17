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
  const [viewerToken, setViewerToken] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStreamAndJoin() {
      try {
        setLoading(true)
        setError(null)

        // ============================
        // 1. Fetch Stream Detail
        // ============================
        const res = await api.get(API_ROUTES.GET_STREAM(streamId))

        if (!res.data.success) {
          throw new Error(res.data.error || "Stream not found")
        }

        const streamData = res.data.stream
        setStream(streamData)

        // ============================
        // 2. Request Viewer Token
        // ============================
        const tokenRes = await api.get(
          API_ROUTES.VIEWER_TOKEN(streamId)
        )

        if (!tokenRes.data.success) {
          throw new Error(
            tokenRes.data.error || "Failed to get viewer token"
          )
        }

        setViewerToken(tokenRes.data.token)
      } catch (err: any) {
        console.error("❌ Stream join error:", err)
        setError(err.message)
        setStream(null)
        setViewerToken(null)
      } finally {
        setLoading(false)
      }
    }

    fetchStreamAndJoin()
  }, [streamId])

  // ============================
  // UI States
  // ============================
  if (loading) {
    return <StreamSplash label="Joining Stream..." />
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p className="text-red-500">❌ {error}</p>
      </div>
    )
  }

  if (!stream) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p>❌ Stream not found</p>
      </div>
    )
  }

  if (!viewerToken) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p>❌ Unable to join LiveKit room</p>
      </div>
    )
  }

  // ============================
  // Stream Ready
  // ============================
  return (
    <StreamWithChat
      stream={stream}
      viewerToken={viewerToken}
    />
  )
}
