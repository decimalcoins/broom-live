"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

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
  const router = useRouter()

  const [token, setToken] = useState<string | null>(null)
  const [loadingToken, setLoadingToken] = useState(true)
  const [tokenError, setTokenError] = useState<string | null>(null)

  // ============================
  // ✅ ROOM NAME MUST MATCH HOST
  // ============================
  const roomName = stream.host_id ? `broom_${stream.host_id}` : null

  const { room, connect, disconnect, isConnected } = useLiveKit(roomName, token)

  // ============================
  // ✅ FETCH VIEWER TOKEN (PER STREAM)
  // ============================
  useEffect(() => {
    if (!roomName) return

    const fetchToken = async () => {
      try {
        setLoadingToken(true)
        setTokenError(null)

        const res = await fetch(
          `/api/streams/${stream.id}/viewer-token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roomName,
              identity: `viewer-${Date.now()}`,
            }),
          }
        )

        const data = await res.json()

        if (!res.ok || !data.token) {
          throw new Error(data.error || "Viewer token generation failed")
        }

        setToken(data.token)
      } catch (err: any) {
        console.error("Viewer Token Error:", err)
        setTokenError(err.message)
      } finally {
        setLoadingToken(false)
      }
    }

    fetchToken()
  }, [roomName, stream.id])

  // ============================
  // ✅ CONNECT ROOM
  // ============================
  useEffect(() => {
    if (!token) return

    connect()

    return () => disconnect()
  }, [token, connect, disconnect])

  // ============================
  // ✅ LISTEN STREAM END EVENT
  // ============================
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

        // 🎁 Gift Event Forward to UI
        if (msg.type === "gift") {
          window.dispatchEvent(
            new CustomEvent("livekit-gift", {
              detail: msg,
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

  // ============================
  // HOST PARTICIPANT
  // ============================
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

  // ============================
  // HOST VIDEO TRACK
  // ============================
  const publication =
    hostParticipant.getTrackPublication(Track.Source.Camera)

  const videoTrack = publication?.track
  const viewerCount = remoteParticipants.length

  // ============================
  // MAIN UI
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

      {/* CHAT + GIFTS */}
      {children}
    </div>
  )
}
