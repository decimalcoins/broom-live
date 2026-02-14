"use client"

import { use } from "react"
import { useRouter } from "next/navigation"

import { HostStreamView } from "@/components/host-stream-view"
import { StreamSplash } from "@/components/stream-splash"

export default function HostStreamPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  // ✅ Stream ID harus string UUID
  const streamId = id

  // ✅ Jika stream selesai → balik dashboard host
  const handleEndStream = () => {
    router.push("/dashboard/host")
  }

  return (
    <StreamSplash label="Starting Host Stream...">
      <HostStreamView streamId={streamId} onEndStream={handleEndStream} />
    </StreamSplash>
  )
}
