import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { AccessToken } from "livekit-server-sdk"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const streamId = params?.id

    console.log("🔥 HOST TOKEN PARAM ID:", streamId)

    if (!streamId) {
      return NextResponse.json(
        { success: false, error: "Stream ID missing" },
        { status: 400 }
      )
    }

    const streamRes = await db.query(
      `
      SELECT id, host_id, room_name
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

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, error: "LiveKit env missing" },
        { status: 500 }
      )
    }

    const token = new AccessToken(apiKey, apiSecret, {
      identity: `host-${stream.host_id}`,
    })

    token.addGrant({
      roomJoin: true,
      room: stream.room_name,
      canPublish: true,
      canSubscribe: true,
    })

    return NextResponse.json({
      success: true,
      token: token.toJwt(),
      room: stream.room_name,
    })
  } catch (err: any) {
    console.error("❌ HOST TOKEN ERROR:", err)

    return NextResponse.json(
      { success: false, error: err?.message },
      { status: 500 }
    )
  }
}
