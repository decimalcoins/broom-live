import { NextResponse } from "next/server"
import { AccessToken } from "livekit-server-sdk"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const streamId = params.id

    const apiKey = process.env.LIVEKIT_API_KEY!
    const apiSecret = process.env.LIVEKIT_API_SECRET!

    const token = new AccessToken(apiKey, apiSecret, {
      identity: `viewer-${Date.now()}`,
    })

    token.addGrant({
      roomJoin: true,
      room: streamId,
      canPublish: false,
      canSubscribe: true,
    })

    return NextResponse.json({
      token: token.toJwt(),
    })
  } catch (err) {
    console.error("❌ Viewer token error:", err)

    return NextResponse.json(
      { error: "Failed to generate viewer token" },
      { status: 500 }
    )
  }
}