"use client"

import { useEffect, useState } from "react"
import { usePiAuth } from "@/contexts/pi-auth-context"

import { useLiveKit } from "@/hooks/use-livekit"
import { VideoPlayer } from "./video-player"

import { Button } from "./ui/button"
import { Video, VideoOff, Mic, MicOff, StopCircle } from "lucide-react"
import { Card } from "./ui/card"

import { Track } from "livekit-client"

/* ✅ LiveKit Context Provider */
import { LiveKitProvider } from "@/contexts/livekit-context"

/* ✅ Host Chat Panel */
import { ChatPanel } from "./chat-panel"

interface HostStreamViewProps {
  onEndStream: () => void
}

export function HostStreamView({ onEndStream }: HostStreamViewProps) {
  const { userData } = usePiAuth()

  const isDev = process.env.NEXT_PUBLIC_APP_MODE === "dev"

  const [token, setToken] = useState<string | null>(null)
  const [loadingToken, setLoadingToken] = useState(true)
  const [tokenError, setTokenError] = useState<string | null>(null)

  // ===============================
  // ✅ Room Naming
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

  // ============================================
  // ✅ DEV MODE → Dummy Preview
  // ============================================
  if (isDev) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <p className="text-3xl font-bold">🎥 DEV HOST STREAM</p>
          <p className="text-white/70">LiveKit disabled in DEV mode.</p>

          <p className="text-sm bg-white/10 px-4 py-2 rounded-lg">
            Room: <b>{roomName || "Loading..."}</b>
          </p>

          <Button variant="destructive" onClick={onEndStream}>
            End DEV Stream
          </Button>
        </div>
      </div>
    )
  }

  // ============================================
  // ✅ Fetch Host Token
  // ============================================
  useEffect(() => {
    if (!roomName) return

    const fetchToken = async () => {
      try {
        setLoadingToken(true)
        setTokenError(null)

        console.log("🔑 Fetching HOST token...")

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

        console.log("✅ Host token received")
        setToken(data.token)
      } catch (err: any) {
        console.error("❌ Failed to fetch host token:", err)
        setTokenError(err.message)
      } finally {
        setLoadingToken(false)
      }
    }

    fetchToken()
  }, [roomName, username])

  // ============================================
  // ✅ Connect Room when Token Ready
  // ============================================
  useEffect(() => {
    if (!token) return

    console.log("🔌 Host connecting...")
    connect()

    return () => disconnect()
  }, [token, connect, disconnect])

  // ============================================
  // ✅ Auto enable camera + mic once connected
  // ============================================
  useEffect(() => {
    if (isConnected) {
      console.log("🎥 Auto publishing camera & mic")
      toggleCamera()
      toggleMic()
    }
  }, [isConnected])

  // ============================================
  // End Stream
  // ============================================
  const handleEndStream = () => {
    disconnect()
    onEndStream()
  }

  // ============================================
  // UI States
  // ============================================
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
        <div className="text-center space-y-3">
          <p className="text-xl font-bold text-red-500">
            ❌ Failed to Start Stream
          </p>
          <p className="text-sm text-white/70">{tokenError}</p>

          <Button variant="destructive" onClick={onEndStream}>
            Back
          </Button>
        </div>
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

  // ============================================
  // Local Video Track
  // ============================================
  const publication =
    room.localParticipant.getTrackPublication(Track.Source.Camera)

  const localVideoTrack = publication?.track

  // ============================================
  // MAIN HOST STREAM UI
  // ============================================
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

        {/* LIVE Badge */}
        <div className="absolute top-4 right-4">
          <Card className="px-3 py-2 bg-black/60 text-white border-white/20">
            <p className="text-sm font-bold">
              {isConnected ? "🔴 LIVE" : "Connecting..."}
            </p>
          </Card>
        </div>

        {/* ✅ HOST CHAT PANEL */}
        <ChatPanel />

        {/* Controls */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
          {/* Camera */}
          <Button
            size="lg"
            variant={cameraEnabled ? "default" : "destructive"}
            onClick={toggleCamera}
            className="rounded-full w-14 h-14"
          >
            {cameraEnabled ? <Video /> : <VideoOff />}
          </Button>

          {/* Mic */}
          <Button
            size="lg"
            variant={micEnabled ? "default" : "destructive"}
            onClick={toggleMic}
            className="rounded-full w-14 h-14"
          >
            {micEnabled ? <Mic /> : <MicOff />}
          </Button>

          {/* End */}
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