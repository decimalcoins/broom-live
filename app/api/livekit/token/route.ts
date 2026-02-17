import { NextResponse } from "next/server"
import { AccessToken } from "livekit-server-sdk"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    let body: any

    // ✅ SAFE JSON PARSE
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      )
    }

    const roomName = body?.roomName
    const identity = body?.identity
    const role = body?.role

    console.log("📩 TOKEN REQUEST:", { roomName, identity, role })

    // ✅ VALIDATION
    if (!roomName || !identity) {
      return NextResponse.json(
        { success: false, error: "roomName and identity required" },
        { status: 400 }
      )
    }

    // ✅ ENV CHECK
    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET

    if (!apiKey || !apiSecret) {
      console.error("❌ Missing LiveKit ENV keys")

      return NextResponse.json(
        {
          success: false,
          error: "LIVEKIT_API_KEY or LIVEKIT_API_SECRET missing",
        },
        { status: 500 }
      )
    }

    // ✅ ROLE CHECK
    const isHost = String(role).toLowerCase() === "host"

    // ✅ CREATE TOKEN
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

    console.log("✅ TOKEN GENERATED OK")

    return NextResponse.json({
      success: true,
      token: token.toJwt(),
      role: isHost ? "HOST" : "VIEWER",
    })
  } catch (err: any) {
    console.error("❌ TOKEN API ERROR:", err)

    return NextResponse.json(
      {
        success: false,
        error: err.message || "Token generation failed",
      },
      { status: 500 }
    )
  }
}
