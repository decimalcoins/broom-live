export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const res = await db.query(
      `
      SELECT
        id,
        host_id,
        host_username,
        title,
        description,
        thumbnail_url,
        viewer_count,
        started_at
      FROM streams
      WHERE is_live = true
      ORDER BY started_at DESC
      `
    )

    return NextResponse.json({
      success: true,
      streams: res.rows,
    })
  } catch (err) {
    console.error("❌ LIVE STREAMS ERROR:", err)

    return NextResponse.json(
      { success: false, error: "Failed to fetch live streams" },
      { status: 500 }
    )
  }
}
