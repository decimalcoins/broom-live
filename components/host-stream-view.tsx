"use client"

import { useEffect, useState } from "react"

import { usePiAuth } from "@/contexts/pi-auth-context"
import { useCoins } from "@/contexts/coin-context"
import { LiveKitProvider } from "@/contexts/livekit-context"

import { useLiveKit } from "@/hooks/use-livekit"
import { VideoPlayer } from "./video-player"

import { ChatPanel } from "./chat-panel"
import { GiftAnimation } from "./gift-animation"

import { Button } from "./ui/button"
import { Card } from "./ui/card"

import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  StopCircle,
} from "lucide-react"

import { Track } from "livekit-client"

interface HostStreamViewProps {
  streamId: string
  onEndStream: () => void
}

export function HostStreamView({
  streamId,
  onEndStream,
}: HostStreamViewProps) {
  const { userData } = usePiAuth()
  const { addCoins } = useCoins()

  const [giftEvent, setGiftEvent] = useState<any>(null)

  // ✅ ROOM NAME LANGSUNG PAKAI streamId
  const roomName = streamId

  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ======================================================
  // ✅ FETCH HOST TOKEN LANGSUNG
  // ======================================================
  useEffect(() => {
    if (!streamId) return

    async function fetchHostToken() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(
          `/api/streams/${streamId}/host-token`
        )

        const data = await res.json()

        console.log("🔑 HOST TOKEN:", data)

        if (!data.success || !data.token) {
          throw new Error(data.error || "Host token failed")
        }

        setToken(data.token)
      } catch (err: any) {
        console.error("❌ Host Token Error:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchHostToken()
  }, [streamId])

  // ======================================================
  // LIVEKIT CONNECT
  // ======================================================
  const {
    room,
    connect,
    disconnect,
    toggleCamera,
    toggleMic,
    cameraEnabled,
    micEnabled,
    isConnected,
  } = useLiveKit(roomName, token, "host")

  useEffect(() => {
    if (!token) return

    connect()

    return () => {
      disconnect()
    }
  }, [token, connect, disconnect])

  // ======================================================
  // END STREAM
  // ======================================================
  const handleEndStream = async () => {
    if (!room || !userData) return

    try {
      room.localParticipant.publishData(
        new TextEncoder().encode(
          JSON.stringify({ type: "stream_end" })
        ),
        { reliable: true }
      )

      await fetch("/api/streams/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streamId,
          userId: userData.uid,
        }),
      })
    } catch (err) {
      console.error("❌ End stream error:", err)
    }

    disconnect()
    onEndStream()
  }

  // ======================================================
  // UI STATES
  // ======================================================
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        🔑 Starting stream...
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        ❌ {error}
      </div>
    )
  }

  if (!room) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        🔌 Connecting LiveKit...
      </div>
    )
  }

  const publication =
    room.localParticipant.getTrackPublication(
      Track.Source.Camera
    )

  return (
    <LiveKitProvider room={room}>
      <div className="flex flex-col h-screen bg-black relative">
        {publication ? (
          <VideoPlayer track={publication} isLocal />
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            📷 Camera is off
          </div>
        )}

        <div className="absolute top-4 right-4">
          <Card className="px-3 py-2 bg-black/60 text-white">
            {isConnected ? "🔴 LIVE" : "Connecting..."}
          </Card>
        </div>

        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
          <Button onClick={toggleCamera}>
            {cameraEnabled ? <Video /> : <VideoOff />}
          </Button>

          <Button onClick={toggleMic}>
            {micEnabled ? <Mic /> : <MicOff />}
          </Button>

          <Button variant="destructive" onClick={handleEndStream}>
            <StopCircle />
          </Button>
        </div>
      </div>
    </LiveKitProvider>
  )
}
