import { NextResponse } from "next/server"
import { AccessToken } from "livekit-server-sdk"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { roomName, identity, role } = body

    if (!roomName || !identity) {
      return NextResponse.json(
        { success: false, error: "roomName and identity required" },
        { status: 400 }
      )
    }

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, error: "LIVEKIT API KEY/SECRET missing" },
        { status: 500 }
      )
    }

    const isHost = role === "host"

    const token = new AccessToken(apiKey, apiSecret, {
      identity,
    })

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: isHost,
      canSubscribe: true,
      canPublishData: true,
    })

    return NextResponse.json({
      success: true,
      token: token.toJwt(),
    })
  } catch (err: any) {
    console.error("❌ LiveKit Token Error:", err)

    return NextResponse.json(
      { success: false, error: "Token generation failed" },
      { status: 500 }
    )
  }
}
