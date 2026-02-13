"use client";

import { usePiAuth } from "@/contexts/pi-auth-context";

export function DevPanel() {
  // Only show if debug enabled
  if (process.env.NEXT_PUBLIC_DEBUG !== "true") return null;

  const { isAuthenticated, authMessage, userData } = usePiAuth();

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-xl text-xs z-[9999] w-[280px] shadow-lg">
      <p className="font-bold mb-2">⚙ Debug Panel</p>

      <p>
        <b>Authenticated:</b> {String(isAuthenticated)}
      </p>
      <p>
        <b>Status:</b> {authMessage}
      </p>

      {userData && (
        <div className="mt-2 border-t border-gray-600 pt-2">
          <p>
            <b>User:</b> {userData.username}
          </p>
          <p>
            <b>Credits:</b> {userData.credits_balance}
          </p>
        </div>
      )}
    </div>
  );
}