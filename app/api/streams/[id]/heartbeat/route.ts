import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const streamId = params.id

    if (!streamId) {
      return NextResponse.json(
        { success: false, error: "Missing stream id" },
        { status: 400 }
      )
    }

    await db.query(
      `
      UPDATE streams
      SET last_ping = NOW()
      WHERE id = $1 AND is_live = TRUE
      `,
      [streamId]
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Heartbeat error:", err)

    return NextResponse.json(
      { success: false, error: "Heartbeat failed" },
      { status: 500 }
    )
  }
}