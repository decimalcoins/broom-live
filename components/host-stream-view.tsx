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

  // ✅ STREAM ROOM NAME
  const [roomName, setRoomName] = useState<string | null>(null)

  // ✅ LIVEKIT TOKEN
  const [token, setToken] = useState<string | null>(null)

  // UI State
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ======================================================
  // ✅ STEP 1 — FETCH STREAM DETAIL FIRST
  // ======================================================
  useEffect(() => {
    if (!streamId) return

    async function fetchStreamDetail() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/streams/${streamId}`)
        const data = await res.json()

        console.log("🎥 STREAM DETAIL:", data)

        if (!data.success) {
          throw new Error(data.error || "Stream not found")
        }

        if (!data.stream?.room_name) {
          throw new Error("room_name missing in DB")
        }

        setRoomName(data.stream.room_name)
      } catch (err: any) {
        console.error("❌ Stream Detail Error:", err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchStreamDetail()
  }, [streamId])

  // ======================================================
  // ✅ STEP 2 — FETCH HOST TOKEN AFTER roomName READY
  // ======================================================
  useEffect(() => {
    if (!streamId || !roomName) return

    async function fetchHostToken() {
      try {
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
  }, [streamId, roomName])

  // ======================================================
  // ✅ STEP 3 — LIVEKIT CONNECT
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
  // ✅ STEP 4 — REALTIME GIFTS
  // ======================================================
  useEffect(() => {
    if (!room) return

    const handleData = (payload: Uint8Array) => {
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload))

        if (msg.type === "gift") {
          console.log("🎁 Gift Received:", msg.data)

          addCoins(msg.data.gift.coin_cost)
          setGiftEvent(msg.data)

          setTimeout(() => setGiftEvent(null), 3000)
        }
      } catch (err) {
        console.error("Gift parse error:", err)
      }
    }

    room.on("dataReceived", handleData)

    return () => {
      room.off("dataReceived", handleData)
    }
  }, [room, addCoins])

  // ======================================================
  // ✅ END STREAM
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
        <p>🔑 Starting stream...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p className="text-red-500 text-lg">
          ❌ {error}
        </p>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p>🔌 Connecting LiveKit...</p>
      </div>
    )
  }

  // ======================================================
  // CAMERA TRACK
  // ======================================================
  const publication =
    room.localParticipant.getTrackPublication(
      Track.Source.Camera
    )

  // ======================================================
  // MAIN UI
  // ======================================================
  return (
    <LiveKitProvider room={room}>
      <div className="flex flex-col h-screen bg-black relative">
        {/* VIDEO */}
        {publication ? (
          <VideoPlayer track={publication} isLocal />
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            <p>📷 Camera is off</p>
          </div>
        )}

        {/* LIVE BADGE */}
        <div className="absolute top-4 right-4">
          <Card className="px-3 py-2 bg-black/60 text-white">
            {isConnected ? "🔴 LIVE" : "Connecting..."}
          </Card>
        </div>

        {/* 🎁 Gift */}
        {giftEvent && (
          <GiftAnimation
            gift={giftEvent}
            onComplete={() => setGiftEvent(null)}
          />
        )}

        {/* 💬 Chat */}
        <ChatPanel username={userData?.username || "Host"} />

        {/* CONTROLS */}
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
