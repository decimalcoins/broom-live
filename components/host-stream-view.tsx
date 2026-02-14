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

import { Video, VideoOff, Mic, MicOff, StopCircle } from "lucide-react"
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

  const [token, setToken] = useState<string | null>(null)
  const [loadingToken, setLoadingToken] = useState(true)
  const [tokenError, setTokenError] = useState<string | null>(null)

  // ===============================
  // ✅ ROOM NAME FIXED (UID)
  // Host + Viewer MUST MATCH THIS
  // ===============================
  const roomName = userData?.uid ? `broom_${userData.uid}` : null

  // ===============================
  // LIVEKIT HOOK
  // ===============================
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
  // ✅ FETCH HOST TOKEN
  // ===============================
  useEffect(() => {
    if (!roomName || !userData?.username) return

    const fetchToken = async () => {
      try {
        setLoadingToken(true)
        setTokenError(null)

        const res = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomName,
            identity: `host-${userData.username}`,
            role: "host",
          }),
        })

        const data = await res.json()

        if (!res.ok || !data.token) {
          throw new Error(data.error || "Token generation failed")
        }

        setToken(data.token)
      } catch (err: any) {
        console.error("Host Token Error:", err)
        setTokenError(err.message)
      } finally {
        setLoadingToken(false)
      }
    }

    fetchToken()
  }, [roomName, userData?.username])

  // ===============================
  // ✅ CONNECT ROOM WHEN TOKEN READY
  // ===============================
  useEffect(() => {
    if (!token) return

    connect()

    return () => {
      disconnect()
    }
  }, [token])

  // ===============================
  // ✅ AUTO ENABLE CAM + MIC ONCE
  // ===============================
  useEffect(() => {
    if (!room || !isConnected) return

    room.localParticipant.setCameraEnabled(true)
    room.localParticipant.setMicrophoneEnabled(true)
  }, [room, isConnected])

  // ===============================
  // ✅ LISTEN GIFTS REALTIME
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

    return () => {
      room.off("dataReceived", handleData)
    }
  }, [room])

  // ===============================
  // ✅ END STREAM
  // ===============================
  const handleEndStream = async () => {
    if (!room || !userData) return

    try {
      // Broadcast END event
      room.localParticipant.publishData(
        new TextEncoder().encode(
          JSON.stringify({
            type: "stream_end",
          })
        ),
        { reliable: true }
      )

      // Update DB
      await fetch("/api/streams/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streamId,
          userId: userData.id,
        }),
      })
    } catch (err) {
      console.error("End stream failed:", err)
    }

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
  // ✅ LOCAL VIDEO TRACK SAFE
  // ===============================
  const publication =
    room.localParticipant.getTrackPublication(Track.Source.Camera)

  const localVideoTrack = publication?.videoTrack ?? null

  // ===============================
  // MAIN HOST UI
  // ===============================
  return (
    <LiveKitProvider room={room}>
      <div className="flex flex-col h-screen bg-black relative">
        {/* VIDEO */}
        {localVideoTrack ? (
          <VideoPlayer track={localVideoTrack} isLocal />
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
