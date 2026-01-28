"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePiAuth } from "@/contexts/pi-auth-context";
import { api } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import type { Stream } from "@/lib/types";

import { Video, Users } from "lucide-react";
import { CoinBalance } from "@/components/coin-balance";
import { BuyCoinsDialog } from "@/components/buy-coins-dialog";

export default function HomePage() {
  const router = useRouter();
  const { userData } = usePiAuth();
  const [liveStreams, setLiveStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveStreams();
  }, []);

  const fetchLiveStreams = async () => {
    try {
      const res = await api.get<Stream[]>(`${API_ROUTES.GET_STREAMS}?is_live=true`);
      setLiveStreams(res.data);
    } catch (err) {
      console.error("Failed to fetch streams:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Video className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">BROOM</h1>
          </div>

          <div className="flex items-center gap-3">
            <CoinBalance balance={userData?.coin_balance ?? 0} />
            <BuyCoinsDialog onSuccess={() => window.location.reload()} />
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-4">Live Now</h2>

        {loading ? (
          <div className="py-12 text-center">Loading streams...</div>
        ) : liveStreams.length === 0 ? (
          <div className="py-12 text-center opacity-70">
            Belum ada streamer live.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveStreams.map((stream) => (
              <div
                key={stream.id}
                className="border rounded-lg cursor-pointer overflow-hidden bg-card hover:shadow-lg transition"
                onClick={() => router.push(`/stream/${stream.id}`)}
              >
                <div className="relative aspect-video bg-muted flex justify-center items-center">
                  <Video className="w-12 h-12 opacity-60" />
                  <div className="absolute top-2 left-2 text-xs bg-red-500 text-white px-2 py-1 rounded">LIVE</div>
                  <div className="absolute top-2 right-2 text-xs bg-black/60 text-white px-2 py-1 rounded flex items-center gap-1">
                    <Users className="w-3 h-3" /> {stream.viewer_count}
                  </div>
                </div>
                <div className="p-3">
                  <div className="font-semibold">{stream.title}</div>
                  <div className="opacity-70 text-sm">@{stream.host_username}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
