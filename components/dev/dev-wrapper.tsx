"use client";

export function DevWrapper({ children }: { children: React.ReactNode }) {
  // DEV only
  if (process.env.NEXT_PUBLIC_APP_MODE !== "dev") {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* DEV Banner */}
      <div className="fixed top-0 left-0 w-full bg-yellow-400 text-black text-xs p-2 z-[9999]">
        ⚡ DEV MODE ACTIVE — Testing & Editing Mode
      </div>

      <div className="pt-8">{children}</div>
    </div>
  );
}