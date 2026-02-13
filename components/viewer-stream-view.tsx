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
  const isDev = process.env.NEXT_PUBLIC_APP_MODE === "dev"

  const [token, setToken] = useState<string | null>(null)
  const [loadingToken, setLoadingToken] = useState(true)
  const [tokenError, setTokenError] = useState<string | null>(null)

  // ============================
  // ✅ ROOM NAME
  // ============================
  const roomName = stream.host_username
    ? `broom_${stream.host_username}`
    : null

  const { room, connect, disconnect, isConnected } = useLiveKit(roomName, token)

  // ============================
  // ✅ DEV MODE UI
  // ============================
  if (isDev) {
    return (
      <div className="flex flex-col h-screen bg-black text-white items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-2xl font-bold">🎥 DEV VIEWER MODE</p>
          <p className="text-white/70">LiveKit disabled in DEV mode.</p>

          <p className="text-sm bg-white/10 px-4 py-2 rounded-lg">
            Room: <b>{roomName}</b>
          </p>
        </div>

        {children}
      </div>
    )
  }

  // ============================
  // ✅ Fetch Viewer Token
  // ============================
  useEffect(() => {
    if (!roomName) return

    const fetchToken = async () => {
      try {
        setLoadingToken(true)
        setTokenError(null)

        console.log("🔑 Fetching VIEWER token...")

        const res = await fetch("/api/livekit/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomName,
            identity: `viewer-${Date.now()}`,
            role: "viewer",
          }),
        })

        const data = await res.json()

        if (!res.ok || !data.token) {
          throw new Error(data.error || "Viewer token generation failed")
        }

        console.log("✅ Viewer token received")
        setToken(data.token)
      } catch (err: any) {
        console.error("❌ Failed to fetch viewer token:", err)
        setTokenError(err.message)
      } finally {
        setLoadingToken(false)
      }
    }

    fetchToken()
  }, [roomName])

  // ============================
  // ✅ Connect Room
  // ============================
  useEffect(() => {
    if (!token) return

    console.log("🔌 Viewer connecting...")
    connect()

    return () => disconnect()
  }, [token, connect, disconnect])

  // ============================
  // UI STATES
  // ============================
  if (loadingToken) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p>🔑 Joining stream...</p>
      </div>
    )
  }

  if (tokenError) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center space-y-3">
          <p className="text-xl font-bold text-red-500">
            ❌ Failed to Join Stream
          </p>
          <p className="text-sm text-white/70">{tokenError}</p>
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

  // ============================
  // ✅ Find Host Participant
  // ============================
  const remoteParticipants = Array.from(room.remoteParticipants.values())

  const hostParticipant = remoteParticipants.find((p) =>
    p.identity.startsWith("host-")
  )

  // Kalau host belum join
  if (!hostParticipant) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p>⏳ Host is not live yet...</p>
      </div>
    )
  }

  // ============================
  // ✅ Get Host Video Track
  // ============================
  const publication = hostParticipant.getTrackPublication(
    Track.Source.Camera
  )

  const videoTrack = publication?.track

  // Viewer count = semua remote participant selain viewer sendiri
  const viewerCount = remoteParticipants.length

  // ============================
  // ✅ MAIN UI
  // ============================
  return (
    <div className="flex flex-col h-screen bg-black relative">
      {/* VIDEO */}
      {videoTrack ? (
        <VideoPlayer
          track={videoTrack}
          participant={hostParticipant}
          className="w-full h-full"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-white text-center px-6">
          <div className="space-y-2">
            <p className="text-xl font-bold">
              {isConnected ? "Waiting for host video..." : "Connecting..."}
            </p>
            <p className="text-white/60 text-sm">
              Host may not have enabled camera yet.
            </p>
          </div>
        </div>
      )}

      {/* OVERLAY */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <Card className="px-3 py-2 bg-black/60 text-white border-white/20">
          <p className="text-sm font-medium">@{stream.host_username}</p>
          <p className="text-xs text-white/70">{stream.title}</p>
        </Card>

        <Card className="px-3 py-2 bg-black/60 text-white border-white/20 flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span className="text-sm">{viewerCount} watching</span>
        </Card>
      </div>

      {/* CHAT + GIFTS */}
      {children}
    </div>
  )
}