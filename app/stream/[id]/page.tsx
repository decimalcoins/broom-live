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

  useEffect(() => {
    const fetchStream = async () => {
      try {
        const res = await api.get(API_ROUTES.GET_STREAM(streamId))

        console.log("STREAM DETAIL:", res.data)

        if (!res.data.success) {
          setStream(null)
          return
        }

        setStream(res.data.stream)
      } catch (err) {
        console.error("❌ Fetch stream failed:", err)
        setStream(null)
      } finally {
        setLoading(false)
      }
    }

    fetchStream()
  }, [streamId])

  if (loading) return <StreamSplash label="Joining Stream..." />

  if (!stream) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p>❌ Stream not found or offline</p>
      </div>
    )
  }

  return <StreamWithChat stream={stream} />
}
