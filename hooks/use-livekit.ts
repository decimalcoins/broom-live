"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import {
  Room,
  RoomEvent,
  type RemoteTrack,
  type RemoteTrackPublication,
  type RemoteParticipant,
} from "livekit-client"

import { LiveKitService } from "@/lib/livekit"

type LiveKitRole = "host" | "viewer"

export function useLiveKit(
  roomName: string | null,
  token: string | null,
  role: LiveKitRole = "viewer"
) {
  const [room, setRoom] = useState<Room | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [micEnabled, setMicEnabled] = useState(false)

  // ✅ Service persistent
  const serviceRef = useRef<LiveKitService | null>(null)

  if (!serviceRef.current) {
    serviceRef.current = new LiveKitService()
  }

  const livekitService = serviceRef.current

  // ============================
  // ✅ CONNECT ROOM
  // ============================
  const connect = useCallback(async () => {
    if (!roomName || !token) return

    try {
      console.log("🔌 Connecting LiveKit...")
      console.log("Room:", roomName)
      console.log("Role:", role)

      const connectedRoom = await livekitService.connect({
        url: process.env.NEXT_PUBLIC_LIVEKIT_URL!,
        token,
      })

      setRoom(connectedRoom)
      setIsConnected(true)

      console.log("✅ LiveKit Connected!")

      // ✅ HOST publish cam+mic
      if (role === "host") {
        console.log("🎥 Host enabling camera...")
        await connectedRoom.localParticipant.setCameraEnabled(true)
        setCameraEnabled(true)

        console.log("🎤 Host enabling mic...")
        await connectedRoom.localParticipant.setMicrophoneEnabled(true)
        setMicEnabled(true)
      }

      // Room events
      connectedRoom.on(RoomEvent.Connected, () => {
        console.log("✅ Room connected")
        setIsConnected(true)
      })

      connectedRoom.on(RoomEvent.Disconnected, () => {
        console.log("❌ Room disconnected")
        setIsConnected(false)
      })

      connectedRoom.on(
        RoomEvent.TrackSubscribed,
        (
          track: RemoteTrack,
          publication: RemoteTrackPublication,
          participant: RemoteParticipant
        ) => {
          console.log(
            "📡 Track subscribed:",
            track.kind,
            "from",
            participant.identity
          )
        }
      )
    } catch (err) {
      console.error("❌ LiveKit connection error:", err)
      setError(err instanceof Error ? err.message : "Failed to connect")
    }
  }, [roomName, token, role, livekitService])

  // ============================
  // ✅ DISCONNECT ROOM
  // ============================
  const disconnect = useCallback(() => {
    console.log("🔌 Disconnecting LiveKit...")

    livekitService.disconnect()

    setRoom(null)
    setIsConnected(false)
    setCameraEnabled(false)
    setMicEnabled(false)
  }, [livekitService])

  // ============================
  // 🎥 CAMERA TOGGLE (HOST ONLY)
  // ============================
  const toggleCamera = useCallback(async () => {
    if (!room) return
    if (role !== "host") return

    const enabled = !cameraEnabled
    await room.localParticipant.setCameraEnabled(enabled)

    setCameraEnabled(enabled)
  }, [room, cameraEnabled, role])

  // ============================
  // 🎤 MIC TOGGLE (HOST ONLY)
  // ============================
  const toggleMic = useCallback(async () => {
    if (!room) return
    if (role !== "host") return

    const enabled = !micEnabled
    await room.localParticipant.setMicrophoneEnabled(enabled)

    setMicEnabled(enabled)
  }, [room, micEnabled, role])

  // ============================
  // ✅ SEND DATA (GIFTS / CHAT)
  // ============================
  const sendData = useCallback(
    (message: any) => {
      if (!room) return

      try {
        const payload = new TextEncoder().encode(JSON.stringify(message))

        room.localParticipant.publishData(payload, {
          reliable: true,
        })

        console.log("📨 Data sent:", message)
      } catch (err) {
        console.error("❌ Failed to send data:", err)
      }
    },
    [room]
  )

  // Cleanup
  useEffect(() => {
    return () => disconnect()
  }, [disconnect])

  return {
    room,
    isConnected,
    error,

    // host-only controls
    cameraEnabled,
    micEnabled,
    toggleCamera,
    toggleMic,

    // realtime data channel
    sendData,

    connect,
    disconnect,
  }
}
