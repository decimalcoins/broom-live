import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const { userId, title, description } = await req.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId required" },
        { status: 400 }
      )
    }

    // ============================
    // ✅ FIX: Support ID OR UID
    // ============================
    const userRes = await db.query(
      `
      SELECT id, uid, username, role
      FROM users
      WHERE id=$1 OR uid=$1
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
    // ✅ Role Guard
    // ============================
    if (String(user.role).toUpperCase() !== "HOST") {
      return NextResponse.json(
        { success: false, error: "Only HOST can start streams" },
        { status: 403 }
      )
    }

    // ============================
    // ✅ Prevent multiple live streams
    // ============================
    const existing = await db.query(
      `
      SELECT id FROM streams
      WHERE host_id=$1 AND is_live=true
      LIMIT 1
      `,
      [user.id]
    )

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: "Stream already active" },
        { status: 400 }
      )
    }

    // ============================
    // ✅ Create Stream
    // ============================
    const streamId = crypto.randomUUID()

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
        user.uid,
        user.username,
        title?.trim() || `Live by ${user.username}`,
        description?.trim() || null,
      ]
    )

    return NextResponse.json({
      success: true,
      stream: streamRes.rows[0],
    })
  } catch (err: any) {
    console.error("❌ CREATE STREAM ERROR:", err)

    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to create stream",
      },
      { status: 500 }
    )
  }
}
