import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { streamId } = await req.json()

    if (!streamId) {
      return NextResponse.json(
        { success: false, error: "streamId required" },
        { status: 400 }
      )
    }

    await db.query(
      `
      UPDATE streams
      SET is_live = false,
          ended_at = NOW()
      WHERE id = $1
      `,
      [streamId]
    )

    return NextResponse.json({
      success: true,
      message: "Stream ended",
    })
  } catch (err) {
    console.error("❌ End Stream Error:", err)

    return NextResponse.json(
      { success: false, error: "Failed to end stream" },
      { status: 500 }
    )
  }
}
