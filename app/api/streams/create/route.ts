import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  const client = await db.connect()

  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId required" },
        { status: 400 }
      )
    }

    await client.query("BEGIN")

    // ============================
    // ✅ CHECK USER ROLE HOST
    // ============================
    const userRes = await client.query(
      `
      SELECT id, username, role
      FROM users
      WHERE id=$1
      LIMIT 1
      FOR UPDATE
      `,
      [userId]
    )

    const user = userRes.rows[0]

    if (!user) {
      await client.query("ROLLBACK")
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    if (user.role !== "HOST") {
      await client.query("ROLLBACK")
      return NextResponse.json(
        { success: false, error: "Only HOST can start live streams" },
        { status: 403 }
      )
    }

    // ============================
    // ✅ CHECK HOST ALREADY LIVE
    // ============================
    const existingLive = await client.query(
      `
      SELECT id
      FROM streams
      WHERE host_id=$1 AND is_live=true
      LIMIT 1
      `,
      [userId]
    )

    if (existingLive.rows.length > 0) {
      await client.query("ROLLBACK")
      return NextResponse.json(
        { success: false, error: "You already have an active stream" },
        { status: 400 }
      )
    }

    // ============================
    // ✅ CREATE STREAM RECORD
    // ============================
    const streamRes = await client.query(
      `
      INSERT INTO streams (
        host_id,
        host_username,
        is_live,
        viewer_count,
        started_at,
        created_at,
        host_connected,
        host_published
      )
      VALUES ($1, $2, true, 0, NOW(), NOW(), true, false)
      RETURNING *
      `,
      [user.id, user.username]
    )

    const stream = streamRes.rows[0]

    await client.query("COMMIT")

    return NextResponse.json({
      success: true,
      message: "🎥 Live stream created successfully!",
      stream,
    })
  } catch (err: any) {
    await client.query("ROLLBACK")

    console.error("❌ STREAM CREATE ERROR:", err)

    return NextResponse.json(
      { success: false, error: err.message || "Stream create failed" },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
