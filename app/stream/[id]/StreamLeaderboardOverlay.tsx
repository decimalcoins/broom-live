"use client";

import { useEffect, useState } from "react";

interface Entry {
  username: string;
  total: number;
  avatar_url?: string;
}

export function StreamLeaderboardOverlay({ streamId }: { streamId: string }) {
  const [list, setList] = useState<Entry[]>([]);
  const [visible, setVisible] = useState(true);

  // Fetch leaderboard setiap 3 detik
  useEffect(() => {
    const fetchData = async () => {
      try {
        const r = await fetch(`/api/leaderboard/stream/${streamId}`);
        const json = await r.json();
        setList(json.supporters || []);
      } catch {}
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);

    return () => clearInterval(interval);
  }, [streamId]);

  // Auto hide setelah 6 detik
  useEffect(() => {
    if (list.length === 0) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(t);
  }, [list]);

  if (list.length === 0) return null;

  return (
    <div
      onMouseEnter={() => setVisible(true)}
      onClick={() => setVisible(!visible)}
      className="absolute top-3 right-3 flex flex-col gap-2 transition-opacity cursor-pointer"
      style={{ opacity: visible ? 1 : 0.2 }}
    >
      {list.slice(0, 3).map((x, i) => (
        <div
          key={i}
          className="flex items-center gap-2 bg-black/45 backdrop-blur-sm text-white px-2 py-1 rounded-xl text-xs"
        >
          <div className="w-5 h-5 rounded-full bg-gray-300 overflow-hidden">
            {x.avatar_url ? (
              <img src={x.avatar_url} className="w-full h-full object-cover" />
            ) : null}
          </div>
          <span className="font-medium">{x.username}</span>
          <span className="text-yellow-300 ml-auto">{x.total}💰</span>
        </div>
      ))}
    </div>
  );
}
