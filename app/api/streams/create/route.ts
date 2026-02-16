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

    // ✅ Find user by ID or UID
    const userRes = await db.query(
      `
      SELECT id, uid, username, role
      FROM users
      WHERE id=$1 OR uid=$1
      LIMIT 1
      `,
      [userId]
    )

    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    const user = userRes.rows[0]

    // ✅ Only HOST can start
    if (String(user.role).toUpperCase() !== "HOST") {
      return NextResponse.json(
        { success: false, error: "Only HOST can start streams" },
        { status: 403 }
      )
    }

    // ✅ Prevent multiple live
    const existing = await db.query(
      `
      SELECT id FROM streams
      WHERE host_id=$1 AND is_live=true
      LIMIT 1
      `,
      [user.id]
    )

    // ✅ If already live → return same streamId
    if (existing.rows.length > 0) {
      return NextResponse.json({
        success: true,
        streamId: existing.rows[0].id,
      })
    }

    // ✅ Create new stream
    const streamId = crypto.randomUUID()

    await db.query(
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

    // ✅ IMPORTANT: return streamId only
    return NextResponse.json({
      success: true,
      streamId,
    })
  } catch (err: any) {
    console.error("❌ CREATE STREAM ERROR:", err)

    return NextResponse.json(
      { success: false, error: "Failed to create stream" },
      { status: 500 }
    )
  }
}
