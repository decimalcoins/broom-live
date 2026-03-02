import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import crypto from "crypto"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const { userId, title, description } = await req.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId (Pi UID) required" },
        { status: 400 }
      )
    }

    // ============================
    // ✅ FIND USER BY UID
    // ============================
    const userRes = await db.query(
      `
      SELECT id, uid, username, role
      FROM users
      WHERE uid=$1
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
    // ✅ ROLE CHECK
    // ============================
    if (String(user.role).toUpperCase() !== "HOST") {
      return NextResponse.json(
        { success: false, error: "Only HOST can start streams" },
        { status: 403 }
      )
    }

    // ============================
    // ✅ CHECK ACTIVE STREAM
    // ============================
    const existing = await db.query(
      `
      SELECT id
      FROM streams
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
    // ✅ CREATE STREAM (NOT LIVE YET)
    // ============================
    const streamId = crypto.randomUUID()
    const roomName = streamId   // ⬅️ gunakan streamId saja biar konsisten

    const streamRes = await db.query(
      `
      INSERT INTO streams (
        id,
        host_id,
        host_uid,
        host_username,
        room_name,
        title,
        description,
        is_live,
        viewer_count,
        created_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,false,0,NOW())
      RETURNING *
      `,
      [
        streamId,
        user.id,
        user.uid,
        user.username,
        roomName,
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