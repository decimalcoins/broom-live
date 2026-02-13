import { NextResponse } from "next/server"
import { AccessToken } from "livekit-server-sdk"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { roomName, identity, role } = body

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "LiveKit API Key/Secret missing" },
        { status: 500 }
      )
    }

    // ============================
    // ROLE BASED PERMISSION
    // ============================
    const isHost = role === "host"

    const token = new AccessToken(apiKey, apiSecret, {
      identity,
    })

    // ============================
    // ✅ GRANTS
    // ============================
    token.addGrant({
      roomJoin: true,
      room: roomName,

      // ✅ Host publish video/audio
      canPublish: isHost,

      // ✅ Viewer cannot publish camera/mic
      canSubscribe: true,

      // ✅ IMPORTANT: Allow DataChannel Chat
      canPublishData: true,
    })

    console.log("✅ LiveKit Token Generated:", {
      roomName,
      identity,
      role,
      canPublish: isHost,
      canPublishData: true,
    })

    return NextResponse.json({
      token: token.toJwt(),
    })
  } catch (err) {
    console.error("❌ Token generation failed:", err)

    return NextResponse.json(
      { error: "Token generation failed" },
      { status: 500 }
    )
  }
}