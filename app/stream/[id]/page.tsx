"use client"

import { use, useEffect, useState } from "react"

import { StreamWithChat } from "@/components/stream-with-chat"
import { StreamSplash } from "@/components/stream-splash" // ✅ NEW

import { api } from "@/lib/api"
import { API_ROUTES } from "@/lib/api-routes"
import type { Stream } from "@/lib/types"

//
// ✅ DEV Mock Stream Detail
//
const DEV_MOCK_STREAM: Stream = {
  id: "mock-001",
  title: "Welcome to Broom Live (DEV)",
  description: "This is a dummy stream page for testing chat + gifts UI.",
  host_username: "DeveloperHost",
  thumbnail_url: "",
  viewer_count: 99,
  is_live: true,
}

export default function StreamPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const [stream, setStream] = useState<Stream | null>(null)
  const [loading, setLoading] = useState(true)

  // ============================
  // ✅ Fetch Stream Detail
  // ============================
  useEffect(() => {
    const fetchStream = async () => {
      try {
        setLoading(true)

        // ============================
        // ✅ DEV MODE → Mock Stream
        // ============================
        if (process.env.NEXT_PUBLIC_APP_MODE === "dev") {
          if (id.startsWith("mock-")) {
            console.warn("⚡ DEV MODE: Using mock stream detail:", id)

            setStream({
              ...DEV_MOCK_STREAM,
              id,
              title: `Mock Stream (${id})`,
            })

            return
          }
        }

        // ============================
        // ✅ PROD MODE → Backend Fetch
        // ============================
        const response = await api.get<Stream>(API_ROUTES.GET_STREAM(id))
        setStream(response.data)
      } catch (err) {
        console.error("❌ Failed to fetch stream:", err)
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
    return (
      <StreamSplash label="Joining Stream...">
        {/* kosong */}
      </StreamSplash>
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
  // ✅ Main Stream Viewer Page
  // ============================
  return (
    <StreamSplash label="Loading Live Room...">
      <StreamWithChat stream={stream} />
    </StreamSplash>
  )
}
