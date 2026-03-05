import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json()

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: "Missing paymentId" },
        { status: 400 }
      )
    }

    if (!process.env.PI_API_BASE || !process.env.PI_API_KEY) {
      console.error("❌ Missing PI API ENV")

      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      )
    }

    console.log("🟡 Approving Payment:", paymentId)

    const response = await fetch(
      `${process.env.PI_API_BASE}/payments/${paymentId}/approve`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${process.env.PI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    )

    const data = await response.json().catch(() => null)

    if (!response.ok || !data?.status?.developer_approved) {
      console.error("❌ PI Approve Failed:", data)

      return NextResponse.json(
        {
          success: false,
          error: "Approve failed",
          details: data,
        },
        { status: response.status }
      )
    }

    // Save/update payment status
    await db.query(
      `
      INSERT INTO payments (payment_id, status)
      VALUES ($1, 'APPROVED')
      ON CONFLICT (payment_id)
      DO UPDATE SET status='APPROVED'
      `,
      [paymentId]
    )

    console.log("🟢 Payment Approved Successfully")

    return NextResponse.json({
      success: true,
      payment: data,
    })
  } catch (err: any) {
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