import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const result = await db.query(`
      SELECT 
        id,
        title,
        description,
        host_id,
        host_username,
        is_live,
        viewer_count,
        started_at
      FROM streams
      WHERE is_live = true
      ORDER BY started_at DESC
    `)

    return NextResponse.json(result.rows)
  } catch (err) {
    console.error("❌ Failed to fetch live streams:", err)

    return NextResponse.json(
      { error: "Failed to fetch live streams" },
      { status: 500 }
    )
  }
}