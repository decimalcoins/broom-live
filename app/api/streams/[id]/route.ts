export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const streamId = context.params.id

    // ✅ VALIDASI ID
    if (!streamId) {
      return NextResponse.json(
        { success: false, error: "Stream ID required" },
        { status: 400 }
      )
    }

    console.log("✅ STREAM ID RECEIVED:", streamId)

    // ✅ FETCH STREAM DETAIL
    const res = await db.query(
      `
      SELECT *
      FROM streams
      WHERE id=$1
      LIMIT 1
      `,
      [streamId]
    )

    // ❌ STREAM NOT FOUND
    if (res.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Stream not found" },
        { status: 404 }
      )
    }

    // ✅ RETURN STREAM
    return NextResponse.json({
      success: true,
      stream: res.rows[0],
    })
  } catch (err: any) {
    console.error("❌ STREAM DETAIL ERROR:", err)

    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to fetch stream detail",
      },
      { status: 500 }
    )
  }
}
