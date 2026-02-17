"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import {
  LiveKitRoom,
  VideoConference,
} from "@livekit/components-react"

import "@livekit/components-styles/dist/styles.css"

export default function HostStreamPage() {
  const params = useParams()
  const router = useRouter()

  const streamId = params.id as string

  const [token, setToken] = useState<string | null>(null)

  // ============================
  // FETCH HOST TOKEN
  // ============================
  useEffect(() => {
    async function startHost() {
      try {
        const res = await fetch(`/api/streams/${streamId}/host-token`)
        const data = await res.json()

        if (data.success) {
          setToken(data.token)
        } else {
          alert("❌ Failed to start stream: " + data.error)
        }
      } catch (err) {
        console.error("Host stream error:", err)
        alert("❌ Cannot connect to host stream")
      }
    }

    startHost()
  }, [streamId])

  // ============================
  // LOADING STATE
  // ============================
  if (!token) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>🎥 Starting live stream...</p>
      </div>
    )
  }

  // ============================
  // MAIN HOST LIVE UI
  // ============================
  return (
    <div className="h-screen">
      {/* HEADER */}
      <div className="p-4 flex justify-between border-b">
        <h1 className="font-bold text-xl">🎥 You are LIVE!</h1>

        <button
          onClick={() => router.push("/dashboard/host")}
          className="px-4 py-2 bg-black text-white rounded-xl"
        >
          End Stream
        </button>
      </div>

      {/* LIVEKIT ROOM */}
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        connect={true}
        data-lk-theme="default"
        style={{ height: "90vh" }}
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  )
}
