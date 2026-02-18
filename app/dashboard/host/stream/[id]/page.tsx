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
  const [roomName, setRoomName] = useState<string | null>(null)

  // ============================
  // Fetch Host Token
  // ============================
  useEffect(() => {
    async function startHost() {
      try {
        const res = await fetch(`/api/streams/${streamId}/host-token`)
        const data = await res.json()

        if (!data.success) {
          alert("❌ Failed to start stream: " + data.error)
          return
        }

        setToken(data.token)
        setRoomName(data.room)
      } catch (err) {
        alert("❌ Server error starting stream")
      }
    }

    startHost()
  }, [streamId])

  // ============================
  // Loading State
  // ============================
  if (!token || !roomName) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p>🎥 Starting Live Stream...</p>
      </div>
    )
  }

  // ============================
  // MAIN HOST LIVE ROOM
  // ============================
  return (
    <div className="h-screen bg-black">
      {/* HEADER */}
      <div className="p-4 flex justify-between border-b border-white/20 text-white">
        <h1 className="font-bold">🔴 You are LIVE now!</h1>

        <button
          onClick={() => router.push("/dashboard/host")}
          className="px-4 py-2 bg-red-600 rounded-xl"
        >
          End Stream
        </button>
      </div>

      {/* LIVEKIT HOST ROOM */}
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        connect={true}
        audio={true}
        video={true}
        style={{ height: "90vh" }}
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  )
}
