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
  const [loadingToken, setLoadingToken] = useState(true)
  const [tokenError, setTokenError] = useState<string | null>(null)

  // ======================================================
  // ✅ STEP 1 — FETCH STREAM DETAIL (FIXED ENDPOINT)
  // ======================================================
  useEffect(() => {
    if (!streamId) return

    async function fetchStreamDetail() {
      try {
        const res = await fetch(
          `/api/streams/detail/${streamId}` // ✅ FIXED
        )

        const data = await res.json()

        console.log("🎥 STREAM DETAIL:", data)

        if (!data.success || !data.stream?.room_name) {
          throw new Error("Stream room_name not found")
        }

        setRoomName(data.stream.room_name)
      } catch (err: any) {
        console.error("❌ Stream Fetch Error:", err)
        setTokenError(err.message)
      }
    }

    fetchStreamDetail()
  }, [streamId])

  // ======================================================
  // ✅ STEP 2 — LIVEKIT HOOK INIT
  // ======================================================
  const {
    room,
    isConnected,
    cameraEnabled,
    micEnabled,
    connect,
    disconnect,
    toggleCamera,
    toggleMic,
  } = useLiveKit(roomName, token, "host")

  // ======================================================
  // ✅ STEP 3 — FETCH HOST TOKEN
  // ======================================================
  useEffect(() => {
    if (!streamId) return

    async function fetchHostToken() {
      try {
        setLoadingToken(true)
        setTokenError(null)

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
        setTokenError(err.message)
      } finally {
        setLoadingToken(false)
      }
    }

    fetchHostToken()
  }, [streamId])

  // ======================================================
  // ✅ STEP 4 — CONNECT WHEN TOKEN READY
  // ======================================================
  useEffect(() => {
    if (!token) return

    connect()
    return () => disconnect()
  }, [token, connect, disconnect])

  // ======================================================
  // ✅ STEP 5 — LISTEN GIFTS
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
    return () => room.off("dataReceived", handleData)
  }, [room, addCoins])

  // ======================================================
  // ✅ STEP 6 — END STREAM
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
      console.error("❌ End stream failed:", err)
    }

    disconnect()
    onEndStream()
  }

  // ======================================================
  // UI STATES
  // ======================================================
  if (loadingToken) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p>🔑 Generating host token...</p>
      </div>
    )
  }

  if (tokenError) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p className="text-red-500">❌ {tokenError}</p>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p>🔌 Connecting to LiveKit room...</p>
      </div>
    )
  }

  // ======================================================
  // LOCAL CAMERA TRACK
  // ======================================================
  const publication = room.localParticipant.getTrackPublication(
    Track.Source.Camera
  )

  // ======================================================
  // MAIN HOST UI
  // ======================================================
  return (
    <LiveKitProvider room={room}>
      <div className="flex flex-col h-screen bg-black relative">
        {publication ? (
          <VideoPlayer track={publication} isLocal />
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            <p>📷 Camera is off</p>
          </div>
        )}

        <div className="absolute top-4 right-4">
          <Card className="px-3 py-2 bg-black/60 text-white border-white/20">
            <p className="text-sm font-bold">
              {isConnected ? "🔴 LIVE" : "Connecting..."}
            </p>
          </Card>
        </div>

        {giftEvent && (
          <GiftAnimation
            gift={giftEvent}
            onComplete={() => setGiftEvent(null)}
          />
        )}

        <ChatPanel username={userData?.username || "Host"} />

        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
          <Button
            size="lg"
            variant={cameraEnabled ? "default" : "destructive"}
            onClick={toggleCamera}
            className="rounded-full w-14 h-14"
          >
            {cameraEnabled ? <Video /> : <VideoOff />}
          </Button>

          <Button
            size="lg"
            variant={micEnabled ? "default" : "destructive"}
            onClick={toggleMic}
            className="rounded-full w-14 h-14"
          >
            {micEnabled ? <Mic /> : <MicOff />}
          </Button>

          <Button
            size="lg"
            variant="destructive"
            onClick={handleEndStream}
            className="rounded-full w-14 h-14"
          >
            <StopCircle />
          </Button>
        </div>
      </div>
    </LiveKitProvider>
  )
}
