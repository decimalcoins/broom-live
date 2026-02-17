"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useLiveKit } from "@/hooks/use-livekit"
import { VideoPlayer } from "./video-player"

import { Track } from "livekit-client"
import { Card } from "./ui/card"
import { Users } from "lucide-react"

import type { Stream } from "@/lib/types"

interface ViewerStreamViewProps {
  stream: Stream
  viewerToken: string // ✅ token dari page.tsx
  children?: React.ReactNode
}

export function ViewerStreamView({
  stream,
  viewerToken,
  children,
}: ViewerStreamViewProps) {
  const router = useRouter()

  // ======================================================
  // ✅ ROOM NAME FROM DB
  // ======================================================
  const roomName = stream.room_name

  // ======================================================
  // ✅ LIVEKIT CONNECT
  // ======================================================
  const { room, connect, disconnect, isConnected } = useLiveKit(
    roomName,
    viewerToken,
    "viewer"
  )

  // ======================================================
  // ✅ CONNECT ON LOAD
  // ======================================================
  useEffect(() => {
    if (!viewerToken) return

    connect()
    return () => disconnect()
  }, [viewerToken, connect, disconnect])

  // ======================================================
  // ✅ LISTEN STREAM END + GIFTS
  // ======================================================
  useEffect(() => {
    if (!room) return

    const handleData = (payload: Uint8Array) => {
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload))

        if (msg.type === "stream_end") {
          alert("🛑 Stream has ended")
          disconnect()
          router.push("/dashboard")
        }

        if (msg.type === "gift") {
          window.dispatchEvent(
            new CustomEvent("livekit-gift", {
              detail: msg.data,
            })
          )
        }
      } catch (err) {
        console.error("Data parse error:", err)
      }
    }

    room.on("dataReceived", handleData)
    return () => room.off("dataReceived", handleData)
  }, [room, disconnect, router])

  // ======================================================
  // UI STATE
  // ======================================================
  if (!room) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p>🔌 Connecting to stream...</p>
      </div>
    )
  }

  // ======================================================
  // HOST PARTICIPANT
  // ======================================================
  const remoteParticipants = Array.from(room.remoteParticipants.values())

  const hostParticipant = remoteParticipants.find((p) =>
    p.identity.startsWith("host-")
  )

  if (!hostParticipant) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p>⏳ Host is not live yet...</p>
      </div>
    )
  }

  // ======================================================
  // HOST VIDEO TRACK
  // ======================================================
  const publication = hostParticipant.getTrackPublication(
    Track.Source.Camera
  )

  const videoTrack = publication?.videoTrack ?? null
  const viewerCount = remoteParticipants.length + 1

  // ======================================================
  // MAIN UI
  // ======================================================
  return (
    <div className="flex flex-col h-screen bg-black relative">
      {videoTrack ? (
        <VideoPlayer
          track={publication}
          participant={hostParticipant}
          className="w-full h-full"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-white">
          <p>{isConnected ? "Waiting for host video..." : "Connecting..."}</p>
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

      {children}
    </div>
  )
}
