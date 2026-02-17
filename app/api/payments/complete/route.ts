import { NextResponse } from "next/server"
import { PI_API_BASE, piHeaders } from "@/lib/pi/piClient"
import { db } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const client = await db.connect()

  try {
    const { paymentId, txid, userId } = await req.json()

    if (!paymentId || !txid || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing paymentId, txid, or userId" },
        { status: 400 }
      )
    }

    // ============================
    // 0. Prevent Double Completion
    // ============================
    const existing = await client.query(
      `
      SELECT status FROM payments
      WHERE payment_id=$1
      LIMIT 1
      `,
      [paymentId]
    )

    if (existing.rows[0]?.status === "COMPLETED") {
      return NextResponse.json(
        { success: false, error: "Payment already completed" },
        { status: 400 }
      )
    }

    // ============================
    // 1. Complete Payment in Pi API
    // ============================
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

    await client.query("BEGIN")

    // ============================
    // 2. Lock User Row
    // ============================
    const userRes = await client.query(
      `
      SELECT id, role, login_order
      FROM users
      WHERE id=$1
      FOR UPDATE
      `,
      [userId]
    )

    const user = userRes.rows[0]

    if (!user) {
      await client.query("ROLLBACK")
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    // Early pioneers should not pay
    if (user.login_order <= 100) {
      await client.query("ROLLBACK")
      return NextResponse.json(
        {
          success: false,
          error: "Early pioneers already receive free HOST access",
        },
        { status: 400 }
      )
    }

    // Already host
    if (String(user.role).toUpperCase() === "HOST") {
      await client.query("ROLLBACK")
      return NextResponse.json(
        { success: false, error: "User already HOST" },
        { status: 400 }
      )
    }

    // ============================
    // 3. Mark Payment Completed
    // ============================
    await client.query(
      `
      UPDATE payments
      SET status='COMPLETED', txid=$2
      WHERE payment_id=$1
      `,
      [paymentId, txid]
    )

    // ============================
    // 4. Unlock Host + Reward
    // ============================
    const rewardCoins = 50000

    await client.query(
      `
      UPDATE users
      SET role='HOST',
          coin_balance = coin_balance + $1
      WHERE id=$2
      `,
      [rewardCoins, userId]
    )

    // ============================
    // 5. Save Unlock Record
    // ============================
    await client.query(
      `
      INSERT INTO host_unlocks (user_id, payment_id, amount_pi, coin_reward)
      VALUES ($1, $2, 1, $3)
      ON CONFLICT (payment_id) DO NOTHING
      `,
      [userId, paymentId, rewardCoins]
    )

    await client.query("COMMIT")

    return NextResponse.json({
      success: true,
      completed: true,
      reward: rewardCoins,
      payment: data,
    })
  } catch (err) {
    await client.query("ROLLBACK")

    console.error("❌ COMPLETE ERROR:", err)

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
