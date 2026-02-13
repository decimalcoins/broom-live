"use client"

import { useEffect, useRef } from "react"
import type { RemoteTrackPublication, RemoteParticipant } from "livekit-client"

interface VideoPlayerProps {
  track: RemoteTrackPublication | null
  participant?: RemoteParticipant
  isLocal?: boolean
  className?: string
}

export function VideoPlayer({ track, participant, isLocal = false, className = "" }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!videoRef.current || !track) return

    const videoTrack = track.videoTrack
    if (!videoTrack) return

    videoTrack.attach(videoRef.current)

    return () => {
      videoTrack.detach()
    }
  }, [track])

  return (
    <video ref={videoRef} className={`w-full h-full object-cover ${className}`} autoPlay playsInline muted={isLocal} />
  )
}
