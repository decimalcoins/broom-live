"use client"

import { useState, useEffect, useCallback } from "react"
import {
  type Room,
  RoomEvent,
  type RemoteTrack,
  type RemoteTrackPublication,
  type RemoteParticipant,
} from "livekit-client"
import { LiveKitService } from "@/lib/livekit"

export function useLiveKit(streamId: string | null, token: string | null) {
  const [room, setRoom] = useState<Room | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [micEnabled, setMicEnabled] = useState(false)

  const livekitService = new LiveKitService()

  const connect = useCallback(async () => {
    if (!streamId || !token) return

    try {
      const connectedRoom = await livekitService.connect({
        url: process.env.NEXT_PUBLIC_LIVEKIT_URL!,
        token,
      })

      setRoom(connectedRoom)
      setIsConnected(true)

      connectedRoom.on(RoomEvent.Connected, () => {
        console.log("[v0] LiveKit room connected")
        setIsConnected(true)
      })

      connectedRoom.on(RoomEvent.Disconnected, () => {
        console.log("[v0] LiveKit room disconnected")
        setIsConnected(false)
      })

      connectedRoom.on(
        RoomEvent.TrackSubscribed,
        (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
          console.log("[v0] Track subscribed:", track.kind)
        },
      )
    } catch (err) {
      console.error("[v0] LiveKit connection error:", err)
      setError(err instanceof Error ? err.message : "Failed to connect")
    }
  }, [streamId, token])

  const disconnect = useCallback(() => {
    livekitService.disconnect()
    setRoom(null)
    setIsConnected(false)
  }, [])

  const toggleCamera = useCallback(async () => {
    try {
      if (cameraEnabled) {
        await livekitService.disableCamera()
        setCameraEnabled(false)
      } else {
        await livekitService.enableCamera()
        setCameraEnabled(true)
      }
    } catch (err) {
      console.error("[v0] Camera toggle error:", err)
    }
  }, [cameraEnabled])

  const toggleMic = useCallback(async () => {
    try {
      if (micEnabled) {
        await livekitService.disableMicrophone()
        setMicEnabled(false)
      } else {
        await livekitService.enableMicrophone()
        setMicEnabled(true)
      }
    } catch (err) {
      console.error("[v0] Microphone toggle error:", err)
    }
  }, [micEnabled])

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
    connect,
    disconnect,
    toggleCamera,
    toggleMic,
  }
}
