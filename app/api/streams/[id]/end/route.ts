import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const streamId = params.id

    if (!streamId) {
      return NextResponse.json(
        { success: false, error: "Stream ID missing" },
        { status: 400 }
      )
    }

    // 🔍 Check stream exists and still live
    const streamRes = await db.query(
      `
      SELECT id, is_live
      FROM streams
      WHERE id=$1
      LIMIT 1
      `,
      [streamId]
    )

    if (streamRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Stream not found" },
        { status: 404 }
      )
    }

    if (!streamRes.rows[0].is_live) {
      return NextResponse.json(
        { success: false, error: "Stream already ended" },
        { status: 400 }
      )
    }

    // ✅ End stream
    await db.query(
      `
      UPDATE streams
      SET is_live = FALSE,
          ended_at = NOW(),
          viewer_count = 0
      WHERE id=$1
      `,
      [streamId]
    )

    return NextResponse.json({
      success: true,
      message: "Stream ended successfully",
    })
  } catch (err) {
    console.error("❌ End Stream Error:", err)

    return NextResponse.json(
      { success: false, error: "Failed to end stream" },
      { status: 500 }
    )
  }
}