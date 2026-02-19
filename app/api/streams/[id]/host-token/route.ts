import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { AccessToken } from "livekit-server-sdk"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const streamId = context?.params?.id

    console.log("🎥 HOST TOKEN REQUEST ID:", streamId)

    if (!streamId) {
      return NextResponse.json(
        { success: false, error: "Stream ID missing" },
        { status: 400 }
      )
    }

    // ============================
    // 1. Ambil Stream dari DB
    // ============================
    const streamRes = await db.query(
      `
      SELECT id, host_id
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

    const stream = streamRes.rows[0]

    // ============================
    // 2. Ambil ENV LiveKit
    // ============================
    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET

    if (!apiKey || !apiSecret) {
      console.error("❌ LiveKit ENV missing")

      return NextResponse.json(
        { success: false, error: "LiveKit env missing" },
        { status: 500 }
      )
    }

    // ============================
    // 3. Generate Token
    // ============================
    const token = new AccessToken(apiKey, apiSecret, {
      identity: `host-${stream.host_id}`, // ✅ pakai host_id dari DB
    })

    token.addGrant({
      roomJoin: true,
      room: streamId, // ✅ room pakai streamId
      canPublish: true,
      canSubscribe: true,
    })

    return NextResponse.json({
      success: true,
      token: token.toJwt(),
      room: streamId,
    })
  } catch (err: any) {
    console.error("❌ HOST TOKEN ERROR:", err)

    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Failed to generate host token",
      },
      { status: 500 }
    )
  }
}
