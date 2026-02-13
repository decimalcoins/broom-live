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

  // ✅ Convert streamId ke number
  const streamId = Number(id)

  // ✅ Jika stream selesai → balik dashboard host
  const handleEndStream = () => {
    router.push("/dashboard/host")
  }

  return (
    <StreamSplash>
      <HostStreamView streamId={streamId} onEndStream={handleEndStream} />
    </StreamSplash>
  )
}
