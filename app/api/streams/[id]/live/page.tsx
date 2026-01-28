"use client";
import { Room, createLocalAudioTrack, createLocalVideoTrack } from "livekit-client";
import { useState } from "react";

export default function HostLivePage() {
  const [room, setRoom] = useState<Room | null>(null);

  async function startLive() {
    const res = await fetch("/api/streams/create", { method: "POST" });
    const data = await res.json();

    const room = new Room();
    await room.connect(data.url, data.token);

    const video = await createLocalVideoTrack();
    const audio = await createLocalAudioTrack();

    await room.localParticipant.publishTrack(video);
    await room.localParticipant.publishTrack(audio);

    setRoom(room);
  }

  return (
    <div>
      {!room && <button onClick={startLive}>Go Live</button>}
      {room && <p>You're Live 🎥</p>}
    </div>
  );
}
