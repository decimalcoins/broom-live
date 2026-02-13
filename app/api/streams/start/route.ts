import { NextResponse } from "next/server"
import { AccessToken } from "livekit-server-sdk"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { streamId, identity } = body

    if (!streamId || !identity) {
      return NextResponse.json(
        { error: "Missing streamId or identity" },
        { status: 400 }
      )
    }

    const apiKey = process.env.LIVEKIT_API_KEY!
    const apiSecret = process.env.LIVEKIT_API_SECRET!

    const token = new AccessToken(apiKey, apiSecret, {
      identity,
    })

    token.addGrant({
      roomJoin: true,
      room: streamId,
      canPublish: true,
      canSubscribe: true,
    })

    return NextResponse.json({
      token: token.toJwt(),
    })
  } catch (err) {
    console.error("❌ Host token error:", err)

    return NextResponse.json(
      { error: "Failed to generate host token" },
      { status: 500 }
    )
  }
}