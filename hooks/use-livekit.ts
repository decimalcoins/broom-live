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

export type LiveKitRole = "host" | "viewer"

export function useLiveKit(
  roomName: string | null,
  token: string | null,
  role: LiveKitRole
) {
  const [room, setRoom] = useState<Room | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [micEnabled, setMicEnabled] = useState(false)

  // ✅ Keep LiveKitService stable
  const serviceRef = useRef<LiveKitService>(new LiveKitService())

  // ============================
  // ✅ CONNECT ROOM
  // ============================
  const connect = useCallback(async () => {
    if (!roomName || !token) return

    try {
      console.log("🔌 Connecting LiveKit...")
      console.log("Room:", roomName)
      console.log("Role:", role)

      const connectedRoom = await serviceRef.current.connect({
        url: process.env.NEXT_PUBLIC_LIVEKIT_URL!,
        token,
      })

      setRoom(connectedRoom)

      // ============================
      // ✅ WAIT ROOM CONNECT EVENT
      // ============================
      connectedRoom.on(RoomEvent.Connected, async () => {
        console.log("✅ Room Connected!")
        setIsConnected(true)

        // ============================
        // ✅ HOST AUTO ENABLE CAM+MIC
        // ============================
        if (role === "host") {
          console.log("🎥 Enabling Host Camera...")
          await connectedRoom.localParticipant.setCameraEnabled(true)
          setCameraEnabled(true)

          console.log("🎤 Enabling Host Microphone...")
          await connectedRoom.localParticipant.setMicrophoneEnabled(true)
          setMicEnabled(true)
        }
      })

      connectedRoom.on(RoomEvent.Disconnected, () => {
        console.log("❌ Room Disconnected")
        setIsConnected(false)
      })

      // ============================
      // ✅ TRACK SUBSCRIBE LOG
      // ============================
      connectedRoom.on(
        RoomEvent.TrackSubscribed,
        (
          track: RemoteTrack,
          publication: RemoteTrackPublication,
          participant: RemoteParticipant
        ) => {
          console.log(
            "📡 Track Subscribed:",
            track.kind,
            "from",
            participant.identity
          )
        }
      )
    } catch (err) {
      console.error("❌ LiveKit connect error:", err)
      setError(err instanceof Error ? err.message : "Failed to connect")
    }
  }, [roomName, token, role])

  // ============================
  // ✅ DISCONNECT ROOM
  // ============================
  const disconnect = useCallback(() => {
    console.log("🔌 Disconnecting LiveKit...")

    serviceRef.current.disconnect()

    setRoom(null)
    setIsConnected(false)

    setCameraEnabled(false)
    setMicEnabled(false)
  }, [])

  // ============================
  // 🎥 TOGGLE CAMERA (HOST ONLY)
  // ============================
  const toggleCamera = useCallback(async () => {
    if (!room) return
    if (role !== "host") return

    const enabled = !cameraEnabled
    await room.localParticipant.setCameraEnabled(enabled)

    setCameraEnabled(enabled)
  }, [room, cameraEnabled, role])

  // ============================
  // 🎤 TOGGLE MIC (HOST ONLY)
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

      const payload = new TextEncoder().encode(JSON.stringify(message))

      room.localParticipant.publishData(payload, {
        reliable: true,
      })

      console.log("📨 Data sent:", message)
    },
    [room]
  )

  // ============================
  // ✅ CLEANUP SAFE
  // ============================
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    room,
    isConnected,
    error,

    cameraEnabled,
    micEnabled,
    toggleCamera,
    toggleMic,

    sendData,

    connect,
    disconnect,
  }
}
