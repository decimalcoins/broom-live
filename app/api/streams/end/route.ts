import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { streamId } = body

    if (!streamId) {
      return NextResponse.json(
        { error: "Missing streamId" },
        { status: 400 }
      )
    }

    await db.query(
      `UPDATE streams SET is_live = false WHERE id = $1`,
      [streamId]
    )

    return NextResponse.json({
      success: true,
      streamId,
    })
  } catch (err) {
    console.error("❌ End stream error:", err)

    return NextResponse.json(
      { error: "Failed to end stream" },
      { status: 500 }
    )
  }
}