"use client";

import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import { use, useEffect, useState } from "react";

export default function HostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await fetch(`/api/streams/${id}/host-token`);
      const json = await res.json();
      setToken(json.token);
    })();
  }, [id]);

  if (!token) return <p>Connecting...</p>;

  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      connect={true}
      video={true}
      audio={true}
    >
      <VideoConference />
    </LiveKitRoom>
  );
}
