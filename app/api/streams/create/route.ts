import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const { userId, title, description } = await req.json()

    // ============================
    // ✅ Validate Input
    // ============================
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId required" },
        { status: 400 }
      )
    }

    // ============================
    // ✅ Load User (include uid!!)
    // ============================
    const userRes = await db.query(
      `
      SELECT id, uid, username, role
      FROM users
      WHERE id=$1
      LIMIT 1
      `,
      [userId]
    )

    const user = userRes.rows[0]

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    // ============================
    // ✅ Role Guard (HOST Only)
    // ============================
    const role = String(user.role).toUpperCase()

    if (role !== "HOST") {
      return NextResponse.json(
        { success: false, error: "Only HOST can start live streams" },
        { status: 403 }
      )
    }

    // ============================
    // ✅ Prevent Multiple Active Streams
    // ============================
    const existingLive = await db.query(
      `
      SELECT id
      FROM streams
      WHERE host_id=$1 AND is_live=true
      LIMIT 1
      `,
      [userId]
    )

    if (existingLive.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: "You already have an active stream" },
        { status: 400 }
      )
    }

    // ============================
    // ✅ Create Stream Record
    // ============================
    const streamId = crypto.randomUUID()

    const streamTitle =
      title?.trim() || `Live Stream by ${user.username}`

    const cleanDescription =
      description?.trim() || null

    // ============================
    // ✅ INSERT STREAM WITH host_uid
    // ============================
    const streamRes = await db.query(
      `
      INSERT INTO streams (
        id,
        host_id,
        host_uid,
        host_username,
        title,
        description,
        is_live,
        viewer_count,
        started_at,
        created_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,true,0,NOW(),NOW())
      RETURNING *
      `,
      [
        streamId,
        user.id,
        user.uid, // ✅ THIS IS KEY FIX
        user.username,
        streamTitle,
        cleanDescription,
      ]
    )

    return NextResponse.json({
      success: true,
      message: "🎥 Live stream created successfully!",
      stream: streamRes.rows[0],
    })
  } catch (err: any) {
    console.error("❌ STREAM CREATE ERROR:", err)

    return NextResponse.json(
      {
        success: false,
        error: err.message || "Stream create failed",
      },
      { status: 500 }
    )
  }
}
