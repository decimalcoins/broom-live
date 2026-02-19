"use client"

import { useParams, useRouter } from "next/navigation"
import { HostStreamView } from "@/components/host-stream-view"
import { StreamSplash } from "@/components/stream-splash"

export default function HostStreamPage() {
  const router = useRouter()
  const params = useParams()

  const streamId = params?.id as string

  if (!streamId) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p className="text-red-500 text-xl">
          ❌ Stream ID missing
        </p>
      </div>
    )
  }

  const handleEndStream = () => {
    router.push("/dashboard/host")
  }

  return (
    <StreamSplash label="Starting Host Stream...">
      <HostStreamView
        streamId={streamId}
        onEndStream={handleEndStream}
      />
    </StreamSplash>
  )
}
