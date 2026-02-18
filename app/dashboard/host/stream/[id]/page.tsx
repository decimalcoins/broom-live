"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import {
  LiveKitRoom,
  VideoConference,
} from "@livekit/components-react"

export default function HostStreamPage() {
  const params = useParams()
  const router = useRouter()

  const streamId = params.id as string
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    async function startHost() {
      const res = await fetch(`/api/streams/${streamId}/host-token`)
      const data = await res.json()

      if (!data.success) {
        alert("❌ Failed to start stream: " + data.error)
        return
      }

      setToken(data.token)
    }

    startHost()
  }, [streamId])

  if (!token) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p>🎥 Starting live stream...</p>
      </div>
    )
  }

  return (
    <div className="h-screen bg-black">
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        connect={true}
        audio
        video
        style={{ height: "100vh" }}
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  )
}
