"use client"

import { useEffect, useState, useCallback, useRef } from "react"

interface WebSocketMessage {
  type: string
  data: any
}

export function useWebSocket(url: string | null) {
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<WebSocketMessage[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  const connect = useCallback(() => {
    if (!url || wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(url)

    ws.onopen = () => {
      console.log("[v0] WebSocket connected")
      setIsConnected(true)
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        setMessages((prev) => [...prev, message])
      } catch (err) {
        console.error("[v0] Failed to parse WebSocket message:", err)
      }
    }

    ws.onclose = () => {
      console.log("[v0] WebSocket disconnected")
      setIsConnected(false)
    }

    ws.onerror = (error) => {
      console.error("[v0] WebSocket error:", error)
    }

    wsRef.current = ws
  }, [url])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
      setIsConnected(false)
    }
  }, [])

  const send = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }, [])

  useEffect(() => {
    if (url) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [url, connect, disconnect])

  return {
    isConnected,
    messages,
    send,
    connect,
    disconnect,
  }
}
