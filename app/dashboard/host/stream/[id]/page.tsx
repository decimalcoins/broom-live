"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import {
  LiveKitRoom,
  VideoConference,
} from "@livekit/components-react"

export default function HostStreamPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const streamId = params.id

  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!streamId) {
      setError("Stream ID missing")
      return
    }

    async function startHost() {
      try {
        const res = await fetch(
          `/api/streams/${streamId}/host-token`
        )

        const data = await res.json()

        if (!data.success) {
          throw new Error(data.error || "Token failed")
        }

        setToken(data.token)
      } catch (err: any) {
        console.error("Host start error:", err)
        setError(err.message)
      }
    }

    startHost()
  }, [streamId])

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
        <p>🎥 Starting live stream...</p>
      </div>
    )
  }

  return (
    <div className="h-screen">
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        connect={true}
        style={{ height: "100vh" }}
      >
        <VideoConference />

        <button
          onClick={() => router.push("/dashboard/host")}
          className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-xl"
        >
          End Stream
        </button>
      </LiveKitRoom>
    </div>
  )
}
