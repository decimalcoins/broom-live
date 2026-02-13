import { NextResponse } from "next/server"
import { PI_API_BASE, piHeaders } from "@/lib/pi/piClient"
import { savePayment } from "@/lib/payments-db"

export async function POST(req: Request) {
  try {
    const { paymentId, userId, amount } = await req.json()

    // 1. Approve ke Pi API
    const res = await fetch(
      `${PI_API_BASE}/payments/${paymentId}/approve`,
      {
        method: "POST",
        headers: piHeaders(),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: "Approve failed", details: data },
        { status: res.status }
      )
    }

    // 2. Simpan record ke DB
    await savePayment({ paymentId, userId, amount })

    return NextResponse.json({
      success: true,
      approved: true,
      pi_payment: data,
    })
  } catch (err) {
    console.error("❌ Approve Error:", err)

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
