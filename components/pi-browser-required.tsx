"use client";

import { useEffect, useState } from "react";

export function PiBrowserRequired() {
  const [ready, setReady] = useState(false);
  const [isPi, setIsPi] = useState(false);

  useEffect(() => {
    setIsPi(typeof (window as any).Pi !== "undefined");
    setReady(true);
  }, []);

  if (!ready) return null;

  // Kalau Pi Browser → tidak tampil apa-apa
  if (isPi) return null;

  // Kalau bukan Pi Browser → warning screen
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold">🚫 Pi Browser Required</h1>

        <p className="text-gray-300">
          Aplikasi <b>Broom Live</b> hanya bisa dibuka menggunakan{" "}
          <b>Pi Browser</b>.
        </p>

        <p className="text-sm text-gray-400">
          Silakan buka aplikasi ini dari Pi Network App Platform.
        </p>

        <div className="mt-4 p-3 bg-gray-800 rounded-xl text-sm">
          ⚡ Download Pi Browser melalui aplikasi Pi Network resmi.
        </div>
      </div>
    </div>
  );
}