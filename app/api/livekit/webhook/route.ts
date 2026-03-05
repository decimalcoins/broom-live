import { NextResponse } from "next/server"
import { WebhookReceiver } from "livekit-server-sdk"
import { db } from "@/lib/db"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = await req.text()

    const auth = req.headers.get("authorization")

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: "LiveKit config missing" }, { status: 500 })
    }

    const receiver = new WebhookReceiver(apiKey, apiSecret)

    const event = await receiver.receive(body, auth)

    console.log("LiveKit Event:", event.event)

    // 🔴 Room finished (stream selesai)
    if (event.event === "room_finished") {
      const room = event.room?.name

      if (room) {
        await db.query(
          `
          UPDATE streams
          SET is_live = FALSE,
              ended_at = NOW()
          WHERE id = $1
          `,
          [room]
        )
      }
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error("❌ LiveKit webhook error:", err)

    return NextResponse.json(
      { success: false },
      { status: 500 }
    )
  }
}