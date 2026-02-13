"use client"

import { createContext, useContext } from "react"
import type { Room } from "livekit-client"

interface LiveKitContextValue {
  room: Room | null
}

const LiveKitContext = createContext<LiveKitContextValue>({
  room: null,
})

export function LiveKitProvider({
  room,
  children,
}: {
  room: Room | null
  children: React.ReactNode
}) {
  return (
    <LiveKitContext.Provider value={{ room }}>
      {children}
    </LiveKitContext.Provider>
  )
}

export function useLiveKitContext() {
  return useContext(LiveKitContext)
}