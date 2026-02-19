import { HostStreamView } from "@/components/host-stream-view"
import { StreamSplash } from "@/components/stream-splash"

export default function HostStreamPage({
  params,
}: {
  params: { id: string }
}) {
  const streamId = params.id

  if (!streamId) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        ❌ Stream ID missing
      </div>
    )
  }

  return (
    <StreamSplash label="Starting Host Stream...">
      <HostStreamView
        streamId={streamId}
        onEndStream={() => {}}
      />
    </StreamSplash>
  )
}
