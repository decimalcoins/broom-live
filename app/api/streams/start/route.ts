import { NextResponse } from "next/server"
import { AccessToken } from "livekit-server-sdk"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { streamId, userId, username } = body

    if (!streamId || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing streamId or userId" },
        { status: 400 }
      )
    }

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET

    if (!apiKey || !apiSecret) {
      console.error("❌ LiveKit ENV missing")

      return NextResponse.json(
        { success: false, error: "LiveKit config missing" },
        { status: 500 }
      )
    }

    // 🔑 Host identity
    const identity = `host-${userId}`

    const token = new AccessToken(apiKey, apiSecret, {
      identity,
      name: username || identity,
      ttl: "2h", // token berlaku 2 jam
    })

    token.addGrant({
      roomJoin: true,
      room: streamId,

      canPublish: true,
      canSubscribe: true,

      canPublishData: true,
    })

    return NextResponse.json({
      success: true,
      token: token.toJwt(),
      identity,
      room: streamId,
    })

  } catch (err) {
    console.error("❌ Host token error:", err)

    return NextResponse.json(
      { success: false, error: "Failed to generate host token" },
      { status: 500 }
    )
  }
}