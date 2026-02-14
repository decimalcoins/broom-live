"use client"

import { useEffect, useRef } from "react"
import type {
  LocalVideoTrack,
  RemoteTrackPublication,
  RemoteParticipant,
} from "livekit-client"

interface VideoPlayerProps {
  // ✅ Universal Track Type
  track: LocalVideoTrack | RemoteTrackPublication | null

  participant?: RemoteParticipant
  isLocal?: boolean
  className?: string
}

export function VideoPlayer({
  track,
  participant,
  isLocal = false,
  className = "",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!videoRef.current || !track) return

    // ===============================
    // ✅ LOCAL TRACK CASE
    // ===============================
    if ("attach" in track) {
      track.attach(videoRef.current)

      return () => {
        track.detach()
      }
    }

    // ===============================
    // ✅ REMOTE PUBLICATION CASE
    // ===============================
    const videoTrack = track.videoTrack
    if (!videoTrack) return

    videoTrack.attach(videoRef.current)

    return () => {
      videoTrack.detach()
    }
  }, [track])

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isLocal}
      className={`w-full h-full object-cover ${className}`}
    />
  )
}
