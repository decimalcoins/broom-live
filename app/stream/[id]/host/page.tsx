"use client";

import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import { useEffect, useState } from "react";

export default function HostPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchToken = async () => {
      try {
        const res = await fetch(`/api/streams/${id}/host-token`);
        const json = await res.json();
        setToken(json.token);
      } catch (err) {
        console.error("Failed to fetch host token", err);
      }
    };

    fetchToken();
  }, [id]);

  if (!token) {
    return <p>Connecting...</p>;
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      connect
      video
      audio
    >
      <VideoConference />
    </LiveKitRoom>
  );
}
