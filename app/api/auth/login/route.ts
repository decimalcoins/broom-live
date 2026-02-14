import { NextResponse } from "next/server"
import { verifyPiToken } from "@/lib/pi"

export async function POST(req: Request) {
  try {
    const { pi_auth_token } = await req.json()

    if (!pi_auth_token) {
      return NextResponse.json(
        { success: false, error: "Missing Pi Auth Token" },
        { status: 400 }
      )
    }

    // ✅ Verify Pi Token Only
    const piUser = await verifyPiToken(pi_auth_token)

    if (!piUser?.uid || !piUser?.username) {
      return NextResponse.json(
        { success: false, error: "Invalid Pi user data" },
        { status: 401 }
      )
    }

    // ✅ DO NOT create user here anymore
    // User creation + bonus handled in /api/user/me

    return NextResponse.json({
      success: true,
      message: "✅ Pi Token Verified",
      uid: piUser.uid,
      username: piUser.username,
    })
  } catch (err: any) {
    console.error("❌ LOGIN ERROR:", err)

    return NextResponse.json(
      {
        success: false,
        error: err.message || "Login failed",
      },
      { status: 500 }
    )
  }
}
