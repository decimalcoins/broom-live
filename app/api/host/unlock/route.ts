import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getPayment } from "@/lib/payments-db"

export async function POST(req: Request) {
  const client = await db.connect()

  try {
    const { userId, paymentId } = await req.json()

    if (!userId || !paymentId) {
      return NextResponse.json(
        { success: false, error: "userId and paymentId required" },
        { status: 400 }
      )
    }

    // ============================
    // ✅ CHECK PAYMENT COMPLETED
    // ============================
    const payment = await getPayment(paymentId)

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 }
      )
    }

    if (payment.status !== "COMPLETED") {
      return NextResponse.json(
        { success: false, error: "Payment not completed" },
        { status: 400 }
      )
    }

    if (Number(payment.amount) !== 1) {
      return NextResponse.json(
        { success: false, error: "Host unlock requires exactly 1 Pi" },
        { status: 400 }
      )
    }

    // ============================
    // ✅ START TRANSACTION
    // ============================
    await client.query("BEGIN")

    // ============================
    // ✅ LOCK USER ROW
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

    // ✅ Normalize role
    const role = String(user.role).toUpperCase()

    if (role === "HOST") {
      await client.query("ROLLBACK")
      return NextResponse.json(
        { success: false, error: "User already a HOST" },
        { status: 400 }
      )
    }

    // ============================
    // ✅ EARLY USERS SHOULD NOT PAY
    // ============================
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

    // ============================
    // ✅ PREVENT PAYMENT REUSE
    // ============================
    const paymentUsed = await client.query(
      `
      SELECT id FROM host_unlocks
      WHERE payment_id=$1
      LIMIT 1
      `,
      [paymentId]
    )

    if (paymentUsed.rows.length > 0) {
      await client.query("ROLLBACK")
      return NextResponse.json(
        { success: false, error: "Payment already used" },
        { status: 400 }
      )
    }

    // ============================
    // ✅ PREVENT DOUBLE UNLOCK USER
    // ============================
    const unlockCheck = await client.query(
      `
      SELECT id FROM host_unlocks
      WHERE user_id=$1
      LIMIT 1
      `,
      [userId]
    )

    if (unlockCheck.rows.length > 0) {
      await client.query("ROLLBACK")
      return NextResponse.json(
        { success: false, error: "Host already unlocked" },
        { status: 400 }
      )
    }

    // ============================
    // ✅ UNLOCK HOST + REWARD
    // ============================
    const rewardCoins = 50000

    const updatedUser = await client.query(
      `
      UPDATE users
      SET role='HOST',
          coin_balance = coin_balance + $1
      WHERE id=$2
      RETURNING id, username, role, coin_balance
      `,
      [rewardCoins, userId]
    )

    // ============================
    // ✅ SAVE UNLOCK RECORD
    // ============================
    await client.query(
      `
      INSERT INTO host_unlocks (user_id, payment_id, amount_pi, coin_reward)
      VALUES ($1, $2, 1, $3)
      `,
      [userId, paymentId, rewardCoins]
    )

    await client.query("COMMIT")

    return NextResponse.json({
      success: true,
      message: "🎉 Host unlocked successfully!",
      reward: rewardCoins,
      user: updatedUser.rows[0],
    })
  } catch (err: any) {
    await client.query("ROLLBACK")

    console.error("❌ HOST UNLOCK ERROR:", err)

    return NextResponse.json(
      { success: false, error: err.message || "Unlock failed" },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
