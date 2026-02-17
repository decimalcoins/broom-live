import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { AccessToken } from "livekit-server-sdk"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

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

    // ============================
    // 1. Get Stream Room Name from DB
    // ============================
    const streamRes = await db.query(
      `
      SELECT room_name
      FROM streams
      WHERE id=$1
      LIMIT 1
      `,
      [streamId]
    )

    if (streamRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Stream not found" },
        { status: 404 }
      )
    }

    const roomName = streamRes.rows[0].room_name

    // ============================
    // 2. Generate Viewer Token
    // ============================
    const apiKey = process.env.LIVEKIT_API_KEY!
    const apiSecret = process.env.LIVEKIT_API_SECRET!

    const token = new AccessToken(apiKey, apiSecret, {
      identity: `viewer-${Date.now()}`,
    })

    token.addGrant({
      roomJoin: true,
      room: roomName, // ✅ FIXED
      canPublish: false,
      canSubscribe: true,
    })

    // ============================
    // 3. Return Token
    // ============================
    return NextResponse.json({
      success: true,
      token: token.toJwt(),
      room: roomName,
    })
  } catch (err) {
    console.error("❌ Viewer token error:", err)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate viewer token",
      },
      { status: 500 }
    )
  }
}
