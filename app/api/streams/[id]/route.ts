export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const streamId = params.id

    // ============================
    // ✅ Validate ID
    // ============================
    if (!streamId) {
      return NextResponse.json(
        { success: false, error: "Stream ID required" },
        { status: 400 }
      )
    }

    // ============================
    // ✅ Fetch Stream
    // ============================
    const res = await db.query(
      `
      SELECT
        id,
        host_id,
        host_uid,
        host_username,
        room_name,
        title,
        description,
        is_live,
        viewer_count,
        started_at,
        ended_at,
        created_at
      FROM streams
      WHERE id=$1
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
  } catch (err: any) {
    console.error("❌ STREAM DETAIL ERROR:", err)

    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to fetch stream",
      },
      { status: 500 }
    )
  }
}
