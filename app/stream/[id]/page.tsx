"use client"

import { use, useEffect, useState } from "react"
import { StreamWithChat } from "@/components/stream-with-chat"
import { api } from "@/lib/api"
import { API_ROUTES } from "@/lib/api-routes"
import type { Stream } from "@/lib/types"

export default function StreamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [stream, setStream] = useState<Stream | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStream = async () => {
      try {
        const response = await api.get<Stream>(API_ROUTES.GET_STREAM(id))
        setStream(response.data)
      } catch (err) {
        console.error("[v0] Failed to fetch stream:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStream()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading stream...</p>
      </div>
    )
  }

  if (!stream) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Stream not found</p>
      </div>
    )
  }

  return <StreamWithChat stream={stream} />
}
