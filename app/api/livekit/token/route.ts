import { NextResponse } from "next/server"
import { AccessToken } from "livekit-server-sdk"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const roomName = body.roomName
    const identity = body.identity
    const role = body.role || "viewer"

    // ============================
    // ✅ VALIDATION
    // ============================
    if (!roomName || !identity) {
      return NextResponse.json(
        {
          success: false,
          error: "roomName and identity required",
        },
        { status: 400 }
      )
    }

    // ============================
    // ✅ ENV VARIABLES
    // ============================
    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    const livekitUrl = process.env.LIVEKIT_URL

    if (!apiKey || !apiSecret || !livekitUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            "LIVEKIT_API_KEY / LIVEKIT_API_SECRET / LIVEKIT_URL missing in env",
        },
        { status: 500 }
      )
    }

    // ============================
    // ✅ ROLE CHECK
    // ============================
    const isHost = role.toLowerCase() === "host"

    // ============================
    // ✅ CREATE ACCESS TOKEN
    // ============================
    const token = new AccessToken(apiKey, apiSecret, {
      identity,
    })

    // ============================
    // ✅ GRANTS (HOST vs VIEWER)
    // ============================
    token.addGrant({
      roomJoin: true,
      room: roomName,

      // Host can publish camera + mic
      canPublish: isHost,

      // Everyone can subscribe
      canSubscribe: true,

      // Everyone can send gifts/chat
      canPublishData: true,
    })

    console.log("✅ TOKEN GENERATED:", {
      roomName,
      identity,
      role,
      livekitUrl,
    })

    return NextResponse.json({
      success: true,
      token: token.toJwt(),
      url: livekitUrl,
      role: isHost ? "HOST" : "VIEWER",
    })
  } catch (err: any) {
    console.error("❌ LIVEKIT TOKEN ERROR:", err)

    return NextResponse.json(
      {
        success: false,
        error: err.message || "Token generation failed",
      },
      { status: 500 }
    )
  }
}
