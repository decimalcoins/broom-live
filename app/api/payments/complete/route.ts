import { NextResponse } from "next/server"
import { PI_API_BASE, piHeaders } from "@/lib/pi/piClient"
import { db } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const client = await db.connect()

  try {
    const { paymentId, txid } = await req.json()

    if (!paymentId || !txid) {
      return NextResponse.json(
        { success: false, error: "Missing paymentId or txid" },
        { status: 400 }
      )
    }

    await client.query("BEGIN")

    // 🔒 Lock payment row
    const paymentRes = await client.query(
      `SELECT status FROM payments WHERE payment_id=$1 FOR UPDATE`,
      [paymentId]
    )

    if (!paymentRes.rows.length) {
      await client.query("ROLLBACK")
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 }
      )
    }

    if (paymentRes.rows[0].status === "COMPLETED") {
      await client.query("ROLLBACK")
      return NextResponse.json({
        success: true,
        message: "Payment already completed",
      })
    }

    // 🔎 Verify transaction with Pi server
    const res = await fetch(
      `${PI_API_BASE}/payments/${paymentId}/complete`,
      {
        method: "POST",
        headers: piHeaders(),
        body: JSON.stringify({ txid }),
      }
    )

    const data = await res.json().catch(() => null)

    if (!res.ok || !data?.transaction?.verified) {
      await client.query("ROLLBACK")
      return NextResponse.json(
        { success: false, error: "Transaction not verified" },
        { status: 400 }
      )
    }

    // 🔎 Verify payment amount
    const expectedAmount = 1

    if (Number(data.amount) !== expectedAmount) {
      await client.query("ROLLBACK")
      return NextResponse.json(
        { success: false, error: "Invalid payment amount" },
        { status: 400 }
      )
    }

    const userUid = data.user_uid

    const userRes = await client.query(
      `SELECT id, role FROM users WHERE uid=$1 FOR UPDATE`,
      [userUid]
    )

    const user = userRes.rows[0]

    if (!user) {
      await client.query("ROLLBACK")
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    if (user.role === "HOST") {
      await client.query("ROLLBACK")
      return NextResponse.json({
        success: true,
        message: "User already host",
      })
    }

    // 🪙 Give reward
    await client.query(
      `
      UPDATE users
      SET role='HOST',
          balance = balance + 50000
      WHERE id=$1
      `,
      [user.id]
    )

    // ✅ Mark payment completed
    await client.query(
      `
      UPDATE payments
      SET status='COMPLETED',
          txid=$2
      WHERE payment_id=$1
      `,
      [paymentId, txid]
    )

    await client.query("COMMIT")

    return NextResponse.json({
      success: true,
      payment: data,
    })
  } catch (err) {
    await client.query("ROLLBACK")

    console.error("❌ COMPLETE ERROR:", err)

    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}