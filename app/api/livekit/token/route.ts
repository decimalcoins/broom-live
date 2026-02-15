import { NextResponse } from "next/server"
import { AccessToken } from "livekit-server-sdk"

export async function POST(req: Request) {
  try {
    const { roomName, identity, role } = await req.json()

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
        { success: false, error: "LiveKit API Key/Secret missing" },
        { status: 500 }
      )
    }

    // ============================
    // ✅ ROLE BASED PERMISSION FIX
    // ============================
    const isHost =
      role?.toUpperCase() === "HOST" || role?.toLowerCase() === "host"

    // ============================
    // ✅ CREATE TOKEN
    // ============================
    const token = new AccessToken(apiKey, apiSecret, {
      identity,
    })

    // ============================
    // ✅ GRANTS
    // ============================
    token.addGrant({
      roomJoin: true,
      room: roomName,

      // Host publish camera/mic
      canPublish: isHost,

      // Everyone can subscribe
      canSubscribe: true,

      // Everyone can send chat/gift data
      canPublishData: true,
    })

    console.log("✅ LiveKit Token Generated:", {
      roomName,
      identity,
      role,
      isHost,
    })

    return NextResponse.json({
      success: true,
      token: token.toJwt(),
      role: isHost ? "HOST" : "VIEWER",
    })
  } catch (err) {
    console.error("❌ Token generation failed:", err)

    return NextResponse.json(
      { success: false, error: "Token generation failed" },
      { status: 500 }
    )
  }
}
