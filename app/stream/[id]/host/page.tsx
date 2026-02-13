"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { HostStreamView } from "@/components/host-stream-view"

export default function HostStreamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const handleEndStream = () => {
    router.push("/dashboard/host")
  }

  return <HostStreamView streamId={id} onEndStream={handleEndStream} />
}
