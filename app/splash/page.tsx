"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePiAuth } from "@/contexts/pi-auth-context";

export default function SplashPage() {
  const router = useRouter();
  const { isAuthenticated, reinitialize, authMessage } = usePiAuth();
  const [delayDone, setDelayDone] = useState(false);

  // tampil splash 3 detik
  useEffect(() => {
    const t = setTimeout(() => setDelayDone(true), 3000);
    return () => clearTimeout(t);
  }, []);

  // setelah delay, baru login Pi
  useEffect(() => {
    if (delayDone) {
      console.log("Splash done → starting Pi login...");
      reinitialize();
    }
  }, [delayDone]);

  // jika sudah login → masuk menu
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/menu");
    }
  }, [isAuthenticated]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="text-3xl font-bold">BROOM</div>
      <div className="opacity-70 text-sm mt-2">{authMessage}</div>
    </div>
  );
}
