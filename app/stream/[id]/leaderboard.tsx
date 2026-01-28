"use client";

import { useEffect, useState } from "react";

export function StreamLeaderboard({ streamId }: { streamId: string }) {
  const [data, setData] = useState<any>({ supporters: [], coins: [] });
  const [tab, setTab] = useState<"support" | "coin">("support");

  useEffect(() => {
    fetch(`/api/leaderboard/stream/${streamId}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => setData({ supporters: [], coins: [] }));
  }, [streamId]);

  const list = tab === "support" ? data.supporters : data.coins;

  return (
    <div className="w-64 bg-white border-l p-3 text-black flex flex-col gap-3 overflow-y-auto">
      
      <div className="flex gap-2">
        <button onClick={() => setTab("support")}>
          Supporters
        </button>
        <button onClick={() => setTab("coin")}>
          Coins
        </button>
      </div>

      {list?.map((x: any, i: number) => (
        <div key={i} className="flex justify-between text-sm">
          <span>{i + 1}. {x.username}</span>
          <span>{x.total}</span>
        </div>
      ))}
    </div>
  );
}
