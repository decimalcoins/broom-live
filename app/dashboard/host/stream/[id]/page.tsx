"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import {
  LiveKitRoom,
  VideoConference,
} from "@livekit/components-react"

import "@livekit/components-styles"

export default function HostStreamPage() {
  const params = useParams()
  const router = useRouter()

  const streamId = params.id as string

  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    async function startHost() {
      const res = await fetch(`/api/streams/${streamId}/host-token`)
      const data = await res.json()

      if (data.success) {
        setToken(data.token)
      } else {
        alert("Failed to start stream")
      }
    }

    startHost()
  }, [streamId])

  if (!token) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Starting live stream...</p>
      </div>
    )
  }

  return (
    <div className="h-screen">
      <div className="p-4 flex justify-between border-b">
        <h1 className="font-bold">🎥 You are LIVE!</h1>

        <button
          onClick={() => router.push("/dashboard/host")}
          className="px-4 py-2 bg-black text-white rounded-xl"
        >
          End Stream
        </button>
      </div>

      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        connect={true}
        style={{ height: "90vh" }}
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  )
}
