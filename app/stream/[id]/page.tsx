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

  useEffect(() => {
    const fetchStream = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await api.get(API_ROUTES.GET_STREAM(streamId))

        if (!res.data.success) {
          throw new Error(res.data.error || "Stream not found")
        }

        const streamData = res.data.stream

        // ✅ Jangan reject kalau offline dulu
        setStream(streamData)
      } catch (err: any) {
        setError(err.message)
        setStream(null)
      } finally {
        setLoading(false)
      }
    }

    fetchStream()
  }, [streamId])

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

  return <StreamWithChat stream={stream} />
}
