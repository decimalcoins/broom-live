"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card } from "./ui/card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Send } from "lucide-react"
import { useWebSocket } from "@/hooks/use-websocket"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { API_ROUTES } from "@/lib/api-routes"
import type { ChatMessage, GiftEvent } from "@/lib/types"

interface ChatPanelProps {
  streamId: string
  onGiftReceived?: (gift: GiftEvent) => void
}

export function ChatPanel({ streamId, onGiftReceived }: ChatPanelProps) {
  const { userData } = usePiAuth()
  const [message, setMessage] = useState("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const wsUrl = API_ROUTES.CHAT_WS(streamId)
  const { messages, send, isConnected } = useWebSocket(wsUrl)

  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.type === "chat") {
        setChatMessages((prev) => [...prev, msg.data as ChatMessage])
      } else if (msg.type === "gift" && onGiftReceived) {
        onGiftReceived(msg.data as GiftEvent)
      }
    })
  }, [messages, onGiftReceived])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  const handleSend = () => {
    if (!message.trim() || !userData) return

    send({
      type: "chat",
      data: {
        stream_id: streamId,
        user_id: userData.id,
        username: userData.username,
        message: message.trim(),
      },
    })

    setMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 h-96 pointer-events-none">
      <div className="h-full flex flex-col justify-end p-4 gap-3">
        <div className="flex-1 overflow-y-auto space-y-2 pointer-events-auto">
          {chatMessages.map((msg) => (
            <Card key={msg.id} className="px-3 py-2 bg-black/60 text-white border-white/20 backdrop-blur-sm">
              <p className="text-xs">
                <span className="font-bold">{msg.username}:</span> <span className="text-white/90">{msg.message}</span>
              </p>
            </Card>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2 pointer-events-auto">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="bg-black/60 text-white border-white/20 backdrop-blur-sm"
            disabled={!isConnected}
          />
          <Button onClick={handleSend} disabled={!message.trim() || !isConnected} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
