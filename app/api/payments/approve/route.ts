import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { payment_id } = body

    console.log("✅ PAYMENT APPROVE (Internal API)", payment_id)

    // DEV fallback: always approve
    return NextResponse.json({
      success: true,
      payment_id,
      approved: true,
    })
  } catch (err) {
    console.error("❌ Approve error:", err)
    return NextResponse.json(
      { success: false, error: "Approve failed" },
      { status: 500 }
    )
  }
}