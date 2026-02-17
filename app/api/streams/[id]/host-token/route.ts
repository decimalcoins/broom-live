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
    // 1. Get Stream Room Name
    // ============================
    const streamRes = await db.query(
      `
      SELECT room_name, host_uid, host_username
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

    const { room_name, host_uid, host_username } = streamRes.rows[0]

    // ============================
    // 2. Validate ENV
    // ============================
    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, error: "LiveKit env missing" },
        { status: 500 }
      )
    }

    // ============================
    // 3. Generate Host Token
    // Identity MUST start with host-
    // ============================
    const token = new AccessToken(apiKey, apiSecret, {
      identity: `host-${host_uid || host_username || streamId}`,
    })

    token.addGrant({
      roomJoin: true,
      room: room_name,
      canPublish: true,
      canSubscribe: true,
    })

    return NextResponse.json({
      success: true,
      token: token.toJwt(),
      room: room_name,
    })
  } catch (err) {
    console.error("❌ Host token error:", err)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate host token",
      },
      { status: 500 }
    )
  }
}
