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
    async function loadStream() {
      try {
        setLoading(true)
        setError(null)

        // ============================
        // 1. Fetch Stream Detail
        // ============================
        const streamRes = await api.get(API_ROUTES.GET_STREAM(streamId))

        if (!streamRes.data.success) {
          throw new Error(streamRes.data.error || "Stream not found")
        }

        const streamData: Stream = streamRes.data.stream
        setStream(streamData)

        // ============================
        // 2. Fetch Viewer Token
        // Route: /api/streams/:id/viewer-token
        // ============================
        const tokenRes = await api.get(
          API_ROUTES.VIEWER_TOKEN(streamId)
        )

        if (!tokenRes.data.success) {
          throw new Error(tokenRes.data.error || "Viewer token failed")
        }

        setViewerToken(tokenRes.data.token)
      } catch (err: any) {
        console.error("❌ Join error:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadStream()
  }, [streamId])

  if (loading) return <StreamSplash label="Joining Stream..." />

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p className="text-red-500">❌ {error}</p>
      </div>
    )
  }

  if (!stream || !viewerToken) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p>❌ Unable to join stream</p>
      </div>
    )
  }

  return <StreamWithChat stream={stream} viewerToken={viewerToken} />
}
