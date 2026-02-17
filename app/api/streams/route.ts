export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const res = await db.query(`
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
        started_at
      FROM streams
      ORDER BY started_at DESC
    `)

    return NextResponse.json({
      success: true,
      streams: res.rows,
    })
  } catch (err) {
    console.error("❌ STREAMS LIST ERROR:", err)

    return NextResponse.json(
      { success: false, error: "Failed to fetch streams" },
      { status: 500 }
    )
  }
}
