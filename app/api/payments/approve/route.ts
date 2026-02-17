import { NextResponse } from "next/server"
import { PI_API_BASE, piHeaders } from "@/lib/pi/piClient"
import { savePayment } from "@/lib/payments-db"

/**
 * ✅ Required for Pi Payments on Vercel
 */
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const { paymentId, userId, amount } = await req.json()

    // =========================================
    // 1. Validate Input
    // =========================================
    if (!paymentId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing paymentId or userId",
        },
        { status: 400 }
      )
    }

    // =========================================
    // 2. Approve Payment in Pi Server API
    // =========================================
    const res = await fetch(
      `${PI_API_BASE}/payments/${paymentId}/approve`,
      {
        method: "POST",
        headers: piHeaders(), // Authorization: Key SERVER_API_KEY
      }
    )

    const data = await res.json()

    if (!res.ok) {
      console.error("❌ Pi Approve Failed:", data)

      return NextResponse.json(
        {
          success: false,
          error: "Approve failed",
          details: data,
        },
        { status: res.status }
      )
    }

    // =========================================
    // 3. Save Payment Record to DB
    // =========================================
    await savePayment({
      paymentId,
      userId,
      amount,
      status: "APPROVED",
    })

    // =========================================
    // 4. Return Success
    // =========================================
    return NextResponse.json({
      success: true,
      approved: true,
      payment: data,
    })
  } catch (err) {
    console.error("❌ Approve Error:", err)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    )
  }
}
