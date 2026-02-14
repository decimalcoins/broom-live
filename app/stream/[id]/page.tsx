"use client"

import { use } from "react"
import { useEffect, useState } from "react"

import { StreamWithChat } from "@/components/stream-with-chat"
import { StreamSplash } from "@/components/stream-splash"

import { api } from "@/lib/api"
import { API_ROUTES } from "@/lib/api-routes"
import type { Stream } from "@/lib/types"

export default function StreamPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const [stream, setStream] = useState<Stream | null>(null)
  const [loading, setLoading] = useState(true)

  // ============================
  // ✅ Fetch Stream Detail (REAL ONLY)
  // ============================
  useEffect(() => {
    const fetchStream = async () => {
      try {
        setLoading(true)

        const response = await api.get<{ success: boolean; stream: Stream }>(
          API_ROUTES.GET_STREAM(id)
        )

        if (!response.data.success) {
          setStream(null)
          return
        }

        setStream(response.data.stream)
      } catch (err) {
        console.error("❌ Failed to fetch stream:", err)
        setStream(null)
      } finally {
        setLoading(false)
      }
    }

    fetchStream()
  }, [id])

  // ============================
  // ✅ Splash Screen While Loading
  // ============================
  if (loading) {
    return <StreamSplash label="Joining Stream..." />
  }

  if (!stream) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p>❌ Stream not found or offline</p>
      </div>
    )
  }

  // ============================
  // ✅ Main Stream Viewer Page
  // ============================
  return (
    <StreamSplash label="Loading Live Room...">
      <StreamWithChat stream={stream} />
    </StreamSplash>
  )
}
