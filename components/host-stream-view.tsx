"use client"

import { useEffect, useState } from "react"
import { useLiveKit } from "@/hooks/use-livekit"
import { VideoPlayer } from "./video-player"
import { Button } from "./ui/button"
import { Video, VideoOff, Mic, MicOff, StopCircle } from "lucide-react"
import { Card } from "./ui/card"
import { Track } from "livekit-client"

interface HostStreamViewProps {
  streamId: string
  onEndStream: () => void
}

export function HostStreamView({ streamId, onEndStream }: HostStreamViewProps) {
  const [token, setToken] = useState<string | null>(null)

  const {
    room,
    isConnected,
    cameraEnabled,
    micEnabled,
    connect,
    disconnect,
    toggleCamera,
    toggleMic,
  } = useLiveKit(streamId, token)

  // Fetch token dari API /api/streams/[id]/host-token
  useEffect(() => {
    const fetchToken = async () => {
      const r = await fetch(`/api/streams/${streamId}/host-token`)
      const { token } = await r.json()
      setToken(token)
    }
    fetchToken()
  }, [streamId])

  // Connect begitu dapat token
  useEffect(() => {
    if (token) connect()
    return () => disconnect()
  }, [token, connect, disconnect])

  const localTrack = room?.localParticipant.getTrackPublication(
    Track.Source.Camera
  )

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="relative flex-1 bg-black">
        {localTrack ? (
          <VideoPlayer
            track={localTrack}
            isLocal
            className="w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-white">
            <p>{isConnected ? "Enabling camera..." : "Connecting..."}</p>
          </div>
        )}

        <div className="absolute top-4 right-4">
          <Card className="px-3 py-2 bg-black/60 text-white border-white/20">
            <p className="text-sm">
              {isConnected ? "LIVE" : "Connecting..."}
            </p>
          </Card>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              variant={cameraEnabled ? "default" : "destructive"}
              onClick={toggleCamera}
              className="rounded-full w-14 h-14"
            >
              {cameraEnabled ? (
                <Video className="w-6 h-6" />
              ) : (
                <VideoOff className="w-6 h-6" />
              )}
            </Button>

            <Button
              size="lg"
              variant={micEnabled ? "default" : "destructive"}
              onClick={toggleMic}
              className="rounded-full w-14 h-14"
            >
              {micEnabled ? (
                <Mic className="w-6 h-6" />
              ) : (
                <MicOff className="w-6 h-6" />
              )}
            </Button>

            <Button
              size="lg"
              variant="destructive"
              onClick={onEndStream}
              className="rounded-full w-14 h-14"
            >
              <StopCircle className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
