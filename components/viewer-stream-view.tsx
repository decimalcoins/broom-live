"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useLiveKit } from "@/hooks/use-livekit"
import { VideoPlayer } from "./video-player"
import { Track } from "livekit-client"
import { Card } from "./ui/card"
import { Users } from "lucide-react"
import type { Stream } from "@/lib/types"

interface ViewerStreamViewProps {
  stream: Stream
  children?: React.ReactNode
}

export function ViewerStreamView({ stream, children }: ViewerStreamViewProps) {
  const [token, setToken] = useState<string | null>(null)
  const { room, isConnected, connect, disconnect } = useLiveKit(stream.id, token)

  useEffect(() => {
    // Fetch viewer token from backend
    const fetchToken = async () => {
      try {
        const response = await fetch(`/api/streams/${stream.id}/viewer-token`)
        const data = await response.json()
        setToken(data.token)
      } catch (err) {
        console.error("[v0] Failed to fetch viewer token:", err)
      }
    }

    fetchToken()
  }, [stream.id])

  useEffect(() => {
    if (token) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [token, connect, disconnect])

  const remoteParticipants = Array.from(room?.remoteParticipants.values() || [])
  const hostParticipant = remoteParticipants[0]
  const videoTrack = hostParticipant?.getTrackPublication(Track.Source.Camera)

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="relative flex-1 bg-black">
        {videoTrack ? (
          <VideoPlayer track={videoTrack} participant={hostParticipant} className="w-full h-full" />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-white">
            <p>Waiting for host...</p>
          </div>
        )}

        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Card className="px-3 py-2 bg-black/60 text-white border-white/20">
            <p className="text-sm font-medium">{stream.host_username}</p>
            <p className="text-xs text-white/70">{stream.title}</p>
          </Card>

          <Card className="px-3 py-2 bg-black/60 text-white border-white/20 flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="text-sm">{stream.viewer_count}</span>
          </Card>
        </div>

        {children}
      </div>
    </div>
  )
}
