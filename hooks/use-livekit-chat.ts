"use client"

import { useEffect, useState, useCallback } from "react"
import { RoomEvent } from "livekit-client"

export interface ChatMessage {
  id: string
  sender: string
  text: string
}

export function useLiveKitChat(room: any, username: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])

  // ============================
  // ✅ Receive Messages
  // ============================
  useEffect(() => {
    if (!room) return

    const handleData = (payload: Uint8Array, participant: any) => {
      try {
        const decoded = new TextDecoder().decode(payload)
        const msg = JSON.parse(decoded)

        setMessages((prev) => [...prev, msg])
      } catch (err) {
        console.error("❌ Failed to parse chat message:", err)
      }
    }

    room.on(RoomEvent.DataReceived, handleData)

    return () => {
      room.off(RoomEvent.DataReceived, handleData)
    }
  }, [room])

  // ============================
  // ✅ Send Message
  // ============================
  const sendMessage = useCallback(
    async (text: string) => {
      if (!room || !text.trim()) return

      const msg: ChatMessage = {
        id: Date.now().toString(),
        sender: username,
        text,
      }

      // kirim ke semua participant
      const encoded = new TextEncoder().encode(JSON.stringify(msg))

      await room.localParticipant.publishData(encoded, { reliable: true })

      // tampilkan juga di local UI
      setMessages((prev) => [...prev, msg])
    },
    [room, username]
  )

  return { messages, sendMessage }
}