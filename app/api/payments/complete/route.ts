import { NextResponse } from "next/server"
import { PI_API_BASE, piHeaders } from "@/lib/pi/piClient"
import { completePayment } from "@/lib/payments-db"

export async function POST(req: Request) {
  try {
    const { paymentId, txid } = await req.json()

    // 1. Complete ke Pi API
    const res = await fetch(
      `${PI_API_BASE}/payments/${paymentId}/complete`,
      {
        method: "POST",
        headers: piHeaders(),
        body: JSON.stringify({ txid }),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: "Complete failed", details: data },
        { status: res.status }
      )
    }

    // 2. Update DB
    await completePayment({ paymentId, txid })

    return NextResponse.json({
      success: true,
      completed: true,
      pi_payment: data,
    })
  } catch (err) {
    console.error("❌ Complete Error:", err)

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
