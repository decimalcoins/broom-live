import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { payment_id, txid } = body

    console.log("✅ PAYMENT COMPLETE (Internal API)", payment_id, txid)

    // DEV fallback: always complete
    return NextResponse.json({
      success: true,
      payment_id,
      txid,
      completed: true,
    })
  } catch (err) {
    console.error("❌ Complete error:", err)
    return NextResponse.json(
      { success: false, error: "Complete failed" },
      { status: 500 }
    )
  }
}