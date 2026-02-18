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

    // ============================
    // 1. Cari stream dari DB
    // ============================
    const streamRes = await db.query(
      `
      SELECT room_name, host_username
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

    const { room_name, host_username } = streamRes.rows[0]

    // ============================
    // 2. Generate Host Token LiveKit
    // ============================
    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      {
        identity: `host-${host_username}`,
      }
    )

    token.addGrant({
      roomJoin: true,
      room: room_name,
      canPublish: true,
      canSubscribe: true,
    })

    return NextResponse.json({
      success: true,
      token: token.toJwt(),
    })
  } catch (err) {
    console.error("❌ HOST TOKEN ERROR:", err)

    return NextResponse.json(
      { success: false, error: "Failed to generate host token" },
      { status: 500 }
    )
  }
}
