"use client"

import { useEffect, useRef, useState } from "react"
import { RoomEvent } from "livekit-client"
import { useLiveKitContext } from "@/contexts/livekit-context"

import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Card } from "./ui/card"

interface ChatMessage {
  id: string
  sender: string
  message: string
}

interface ChatPanelProps {
  username: string
}

export function ChatPanel({ username }: ChatPanelProps) {
  const { room } = useLiveKitContext()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState("")

  const bottomRef = useRef<HTMLDivElement | null>(null)

  // ============================
  // ✅ Auto Scroll Down
  // ============================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ============================
  // ✅ Listen Incoming DataChannel Messages
  // ============================
  useEffect(() => {
    if (!room) return

    const handleData = (payload: Uint8Array) => {
      try {
        const decoded = new TextDecoder().decode(payload)
        const data = JSON.parse(decoded)

        if (data.type === "chat") {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              sender: data.sender,
              message: data.message,
            },
          ])
        }
      } catch (err) {
        console.error("❌ Chat decode failed:", err)
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
  const sendMessage = async () => {
    if (!room || !text.trim()) return

    const payload = {
      type: "chat",
      sender: username,
      message: text,
    }

    room.localParticipant.publishData(
      new TextEncoder().encode(JSON.stringify(payload)),
      { reliable: true }
    )

    // show instantly on sender side
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        sender: username,
        message: text,
      },
    ])

    setText("")
  }

  return (
    <div className="absolute bottom-4 left-4 w-[320px] flex flex-col gap-2">
      {/* Chat Messages */}
      <Card className="bg-black/50 border-white/10 text-white p-3 h-[240px] overflow-y-auto rounded-2xl">
        <div className="flex flex-col gap-2 text-sm">
          {messages.length === 0 && (
            <p className="text-white/50 text-center pt-6">
              💬 No messages yet...
            </p>
          )}

          {messages.map((msg) => (
            <div key={msg.id}>
              <span className="font-bold text-green-400">
                {msg.sender}:
              </span>{" "}
              <span>{msg.message}</span>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>
      </Card>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={text}
          placeholder="Type message..."
          className="bg-black/40 text-white border-white/20 rounded-xl"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <Button
          onClick={sendMessage}
          className="rounded-xl bg-green-500 hover:bg-green-600"
        >
          Send
        </Button>
      </div>
    </div>
  )
}