"use client";

import { useRouter } from "next/navigation";

export default function MenuPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <button onClick={() => router.push("/dashboard")}>
        Host Stream
      </button>
      <button onClick={() => router.push("/home")}>
        Viewer
      </button>
    </div>
  );
}
