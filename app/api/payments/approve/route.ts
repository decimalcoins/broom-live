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

    const data = await response.json()

    if (!response.ok || !data.status?.developer_approved) {
      console.error("❌ PI Approve Failed:", data)

      return NextResponse.json(
        { success: false, error: "Approve failed", details: data },
        { status: response.status }
      )
    }

    // OPTIONAL: update DB status
    await db.query(
      `UPDATE payments SET status='APPROVED' WHERE payment_id=$1`,
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
      { success: false, error: "Internal error" },
      { status: 500 }
    )
  }
}