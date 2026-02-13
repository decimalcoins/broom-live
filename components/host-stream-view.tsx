"use client"

import { useEffect, useState } from "react"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { useCoins } from "@/contexts/coin-context"

import { useLiveKit } from "@/hooks/use-livekit"
import { VideoPlayer } from "./video-player"

import { Button } from "./ui/button"
import { Video, VideoOff, Mic, MicOff, StopCircle } from "lucide-react"
import { Card } from "./ui/card"

import { Track } from "livekit-client"

import { LiveKitProvider } from "@/contexts/livekit-context"
import { ChatPanel } from "./chat-panel"
import { GiftAnimation } from "./gift-animation"

interface HostStreamViewProps {
  streamId: number
  onEndStream: () => void
}

export function HostStreamView({ streamId, onEndStream }: HostStreamViewProps) {
  const { userData } = usePiAuth()
  const { addCoins } = useCoins()

  const [giftEvent, setGiftEvent] = useState<any>(null)

  const [token, setToken] = useState<string | null>(null)
  const [loadingToken, setLoadingToken] = useState(true)
  const [tokenError, setTokenError] = useState<string | null>(null)

  // ===============================
  // ROOM NAME
  // ===============================
  const username = userData?.username
  const roomName = username ? `broom_${username}` : null

  const {
    room,
    isConnected,
    cameraEnabled,
    micEnabled,
    connect,
    disconnect,
    toggleCamera,
    toggleMic,
  } = useLiveKit(roomName, token)

  // ===============================
  // FETCH HOST TOKEN
  // ===============================
  useEffect(() => {
    if (!roomName) return

    const fetchToken = async () => {
      try {
        setLoadingToken(true)

        const res = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomName,
            identity: `host-${username}`,
            role: "host",
          }),
        })

        const data = await res.json()

        if (!res.ok || !data.token) {
          throw new Error(data.error || "Token generation failed")
        }

        setToken(data.token)
      } catch (err: any) {
        setTokenError(err.message)
      } finally {
        setLoadingToken(false)
      }
    }

    fetchToken()
  }, [roomName, username])

  // ===============================
  // CONNECT ROOM
  // ===============================
  useEffect(() => {
    if (!token) return
    connect()
    return () => disconnect()
  }, [token])

  // ===============================
  // AUTO ENABLE CAM + MIC
  // ===============================
  useEffect(() => {
    if (isConnected) {
      toggleCamera()
      toggleMic()
    }
  }, [isConnected])

  // ===============================
  // LISTEN GIFTS REALTIME
  // ===============================
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
  }, [room])

  // ===============================
  // ✅ FINAL END STREAM (Realtime)
  // ===============================
  const handleEndStream = async () => {
    if (!userData || !room) return

    try {
      // 1. Broadcast END event to all viewers
      room.localParticipant.publishData(
        new TextEncoder().encode(
          JSON.stringify({
            type: "stream_end",
            message: "Stream has ended",
          })
        ),
        { reliable: true }
      )

      console.log("📢 Stream end broadcast sent")

      // 2. Update DB stream status
      await fetch("/api/streams/end", {
        method: "POST",
        body: JSON.stringify({
          streamId,
          userId: userData.id,
        }),
      })

      console.log("🛑 Stream ended in DB")
    } catch (err) {
      console.error("End stream failed:", err)
    }

    // Disconnect + return dashboard
    disconnect()
    onEndStream()
  }

  // ===============================
  // UI STATES
  // ===============================
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
        <p>🔌 Connecting room...</p>
      </div>
    )
  }

  // ===============================
  // LOCAL VIDEO TRACK
  // ===============================
  const publication =
    room.localParticipant.getTrackPublication(Track.Source.Camera)

  const localVideoTrack = publication?.track

  // ===============================
  // MAIN HOST UI
  // ===============================
  return (
    <LiveKitProvider room={room}>
      <div className="flex flex-col h-screen bg-black relative">
        {/* VIDEO */}
        {localVideoTrack ? (
          <VideoPlayer track={localVideoTrack} isLocal className="w-full h-full" />
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            <p>📷 Camera is off</p>
          </div>
        )}

        {/* LIVE BADGE */}
        <div className="absolute top-4 right-4">
          <Card className="px-3 py-2 bg-black/60 text-white border-white/20">
            <p className="text-sm font-bold">
              {isConnected ? "🔴 LIVE" : "Connecting..."}
            </p>
          </Card>
        </div>

        {/* GIFT ANIMATION */}
        {giftEvent && <GiftAnimation gift={giftEvent.gift} />}

        {/* CHAT */}
        <ChatPanel />

        {/* CONTROLS */}
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
