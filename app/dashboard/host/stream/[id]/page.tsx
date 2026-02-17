"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { LiveKitRoom } from "@livekit/components-react"

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
        alert("❌ Failed to start stream")
      }
    }

    startHost()
  }, [streamId])

  if (!token) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>🎥 Starting live stream...</p>
      </div>
    )
  }

  return (
    <div className="h-screen bg-black text-white">
      {/* HEADER */}
      <div className="p-4 flex justify-between border-b border-white/20">
        <h1 className="font-bold text-xl">🎥 You are LIVE!</h1>

        <button
          onClick={() => router.push("/dashboard/host")}
          className="px-4 py-2 bg-white text-black rounded-xl"
        >
          End Stream
        </button>
      </div>

      {/* LIVEKIT ROOM */}
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        connect={true}
        style={{ height: "90vh" }}
      >
        {/* Host will auto publish camera */}
        <div className="flex items-center justify-center h-full">
          <p>✅ Camera publishing... (Host is live)</p>
        </div>
      </LiveKitRoom>
    </div>
  )
}
