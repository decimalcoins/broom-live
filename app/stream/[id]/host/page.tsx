"use client"

import { useRouter } from "next/navigation"

import { HostStreamView } from "@/components/host-stream-view"
import { StreamSplash } from "@/components/stream-splash"

export default function HostStreamPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()

  // ✅ langsung ambil id dari params
  const streamId = params.id

  // ✅ jika stream selesai → balik dashboard host
  const handleEndStream = () => {
    router.push("/dashboard/host")
  }

  return (
    <StreamSplash label="Starting Host Stream...">
      <HostStreamView streamId={streamId} onEndStream={handleEndStream} />
    </StreamSplash>
  )
}
