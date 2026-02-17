import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const streamId = params.id

    if (!streamId) {
      return NextResponse.json(
        { success: false, error: "Stream ID required" },
        { status: 400 }
      )
    }

    const res = await db.query(
      `SELECT is_live FROM streams WHERE id=$1 LIMIT 1`,
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
      is_live: res.rows[0].is_live,
    })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch status" },
      { status: 500 }
    )
  }
}
