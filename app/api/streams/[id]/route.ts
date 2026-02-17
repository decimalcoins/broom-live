export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const streamId = params.id

    // ✅ VALIDASI
    if (!streamId) {
      return NextResponse.json(
        { success: false, error: "Stream ID required" },
        { status: 400 }
      )
    }

    // ✅ QUERY STREAM
    const res = await db.query(
      `
      SELECT *
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
      { success: false, error: "Failed to fetch stream" },
      { status: 500 }
    )
  }
}
