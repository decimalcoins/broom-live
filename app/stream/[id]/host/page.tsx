"use client"

import { useRouter, useParams } from "next/navigation"
import { HostStreamView } from "@/components/host-stream-view"

export default function HostStreamPage() {
  const router = useRouter()
  const params = useParams()

  const streamId = params?.id as string

  if (!streamId) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        ❌ Stream ID missing
      </div>
    )
  }

  const handleEndStream = () => {
    router.push("/dashboard/host")
  }

  return (
    <HostStreamView
      streamId={streamId}
      onEndStream={handleEndStream}
    />
  )
}
