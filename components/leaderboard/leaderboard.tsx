"use client";

import { useEffect, useState } from "react";
import { formatCoins } from "@/lib/format";

type Entry = {
  username: string;
  avatar_url?: string | null;
  total: number;
};

export default function Leaderboard() {
  const [hosts, setHosts] = useState<Entry[]>([]);
  const [supporters, setSupporters] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const res = await fetch("/api/leaderboard");
    const data = await res.json();
    setHosts(data.hosts);
    setSupporters(data.supporters);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="text-center p-8">Loading...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">

      {/* Top Hosts */}
      <div className="p-4 rounded-xl border bg-card shadow">
        <h2 className="font-bold mb-4 text-xl">⭐ Top Hosts</h2>
        {hosts.map((row, i) => (
          <EntryRow
            key={i}
            rank={i + 1}
            username={row.username}
            avatar={row.avatar_url}
            total={row.total}
          />
        ))}
      </div>

      {/* Top Supporters */}
      <div className="p-4 rounded-xl border bg-card shadow">
        <h2 className="font-bold mb-4 text-xl">💰 Top Supporters</h2>
        {supporters.map((row, i) => (
          <EntryRow
            key={i}
            rank={i + 1}
            username={row.username}
            avatar={row.avatar_url}
            total={row.total}
          />
        ))}
      </div>
    </div>
  );
}

function EntryRow({ rank, username, avatar, total }: {
  rank: number;
  username: string;
  avatar?: string | null;
  total: number;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-6 text-center font-bold">{rank}</div>
      <img
        src={avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`}
        className="w-8 h-8 rounded-full"
      />
      <div className="flex-1">{username}</div>
      <div className="font-semibold">{formatCoins(total)}</div>
    </div>
  );
}
