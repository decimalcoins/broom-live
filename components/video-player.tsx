"use client"

import { useEffect, useRef } from "react"
import type { VideoTrack } from "livekit-client"

interface VideoPlayerProps {
  track: VideoTrack | null
  isLocal?: boolean
  className?: string
}

export function VideoPlayer({
  track,
  isLocal = false,
  className = "",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!videoRef.current || !track) return

    track.attach(videoRef.current)

    return () => {
      track.detach()
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
