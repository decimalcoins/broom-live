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

  // ✅ Service instance stable
  const serviceRef = useRef(new LiveKitService())

  // ============================
  // ✅ CONNECT ROOM
  // ============================
  const connect = useCallback(async () => {
    if (!roomName || !token) return

    try {
      setError(null)

      const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

      if (!livekitUrl) {
        throw new Error("NEXT_PUBLIC_LIVEKIT_URL missing in env")
      }

      console.log("🔌 Connecting LiveKit...")
      console.log("Room:", roomName)
      console.log("Role:", role)
      console.log("URL:", livekitUrl)

      // ============================
      // ✅ CONNECT (await)
      // ============================
      const connectedRoom = await serviceRef.current.connect({
        url: livekitUrl,
        token,
      })

      console.log("✅ Connected successfully!")

      // ✅ SAVE ROOM
      setRoom(connectedRoom)
      setIsConnected(true)

      // ============================
      // ✅ HOST AUTO ENABLE CAM+MIC
      // ============================
      if (role === "host") {
        console.log("🎥 Enabling Camera...")
        await connectedRoom.localParticipant.setCameraEnabled(true)
        setCameraEnabled(true)

        console.log("🎤 Enabling Microphone...")
        await connectedRoom.localParticipant.setMicrophoneEnabled(true)
        setMicEnabled(true)
      }

      // ============================
      // ✅ EVENTS (after connect)
      // ============================
      connectedRoom.on(RoomEvent.Disconnected, () => {
        console.log("❌ Room Disconnected")
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
            "📡 Track Subscribed:",
            track.kind,
            "from",
            participant.identity
          )
        }
      )
    } catch (err: any) {
      console.error("❌ LiveKit Connect Error:", err)

      setError(err.message || "Failed to connect")
      setIsConnected(false)
    }
  }, [roomName, token, role])

  // ============================
  // ✅ DISCONNECT
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
  // 🎥 TOGGLE CAMERA
  // ============================
  const toggleCamera = useCallback(async () => {
    if (!room) return
    if (role !== "host") return

    const enabled = !cameraEnabled

    await room.localParticipant.setCameraEnabled(enabled)
    setCameraEnabled(enabled)
  }, [room, cameraEnabled, role])

  // ============================
  // 🎤 TOGGLE MIC
  // ============================
  const toggleMic = useCallback(async () => {
    if (!room) return
    if (role !== "host") return

    const enabled = !micEnabled

    await room.localParticipant.setMicrophoneEnabled(enabled)
    setMicEnabled(enabled)
  }, [room, micEnabled, role])

  // ============================
  // ✅ SEND DATA
  // ============================
  const sendData = useCallback(
    (message: any) => {
      if (!room) return

      const payload = new TextEncoder().encode(JSON.stringify(message))

      room.localParticipant.publishData(payload, { reliable: true })

      console.log("📨 Data sent:", message)
    },
    [room]
  )

  // ============================
  // ✅ CLEANUP
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
