import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const streamId = params?.id

    if (!streamId) {
      return NextResponse.json(
        { success: false, error: "Stream ID required" },
        { status: 400 }
      )
    }

    const result = await db.query(
      `
      SELECT status
      FROM streams
      WHERE id = $1
      LIMIT 1
      `,
      [streamId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Stream not found" },
        { status: 404 }
      )
    }

    const status = result.rows[0].status

    return NextResponse.json({
      success: true,
      status,
      is_live: status === "active", // compatibility untuk frontend lama
    })

  } catch (err: any) {
    console.error("❌ STATUS ERROR:", err)

    return NextResponse.json(
      { success: false, error: "Failed to fetch status" },
      { status: 500 }
    )
  }
}