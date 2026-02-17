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

  // ✅ Ambil streamId dari URL
  const streamId = params.id

  // ✅ Jika host selesai stream → kembali ke dashboard host
  const handleEndStream = () => {
    router.push("/dashboard/host")
  }

  return (
    <StreamSplash label="Starting Host Stream...">
      <HostStreamView streamId={streamId} onEndStream={handleEndStream} />
    </StreamSplash>
  )
}
