import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { randomUUID } from "crypto"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { hostId, hostUsername, title } = body

    if (!hostId) {
      return NextResponse.json(
        { success: false, error: "Host ID missing" },
        { status: 400 }
      )
    }

    // 🔴 tutup stream lama
    await db.query(
      `
      UPDATE streams
      SET is_live = FALSE
      WHERE host_id = $1
      AND is_live = TRUE
      `,
      [hostId]
    )

    // 🟢 buat stream baru
    const streamId = randomUUID()

    const result = await db.query(
      `
      INSERT INTO streams (
        id,
        host_id,
        host_username,
        title,
        is_live,
        viewer_count
      )
      VALUES ($1,$2,$3,$4,TRUE,0)
      RETURNING *
      `,
      [streamId, hostId, hostUsername, title || "Live"]
    )

    return NextResponse.json({
      success: true,
      stream: result.rows[0],
    })

  } catch (err) {
    console.error("❌ Start stream error:", err)

    return NextResponse.json(
      { success: false, error: "Failed to start stream" },
      { status: 500 }
    )
  }
}