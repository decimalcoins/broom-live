import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const streamId = params.id

    // ============================
    // ✅ Fetch Stream Detail
    // ============================
    const res = await db.query(
      `
      SELECT
        id,
        host_id,
        host_uid,          -- ✅ IMPORTANT FIX
        host_username,
        title,
        description,
        thumbnail_url,
        is_live,
        viewer_count,
        started_at,
        ended_at
      FROM streams
      WHERE id = $1
      LIMIT 1
      `,
      [streamId]
    )

    if (res.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Stream not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      stream: res.rows[0],
    })
  } catch (err) {
    console.error("❌ STREAM DETAIL ERROR:", err)

    return NextResponse.json(
      { success: false, error: "Failed to fetch stream detail" },
      { status: 500 }
    )
  }
}
