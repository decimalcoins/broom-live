import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getPayment } from "@/lib/payments-db"
import { getLastBonusClaim, saveBonusClaim } from "@/lib/bonus-db"

export async function POST(req: Request) {
  try {
    const { userId, paymentId } = await req.json()

    // ============================
    // 1. Payment harus completed
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

    // ============================
    // 2. Cooldown 24 jam
    // ============================
    const lastClaim = await getLastBonusClaim(userId)

    if (lastClaim) {
      const lastTime = new Date(lastClaim.claimed_at).getTime()
      const now = Date.now()

      const diffHours = (now - lastTime) / (1000 * 60 * 60)

      if (diffHours < 24) {
        return NextResponse.json(
          {
            success: false,
            error: "Bonus already claimed today",
            next_claim_in_hours: Math.ceil(24 - diffHours),
          },
          { status: 400 }
        )
      }
    }

    // ============================
    // 3. Tentukan bonus amount
    // ============================
    const bonusAmount = 5000

    // ============================
    // 4. Update user coin_balance
    // ============================
    await db.query(
      `
      UPDATE users
      SET coin_balance = coin_balance + $1
      WHERE id = $2
      `,
      [bonusAmount, userId]
    )

    // ============================
    // 5. Simpan claim record
    // ============================
    await saveBonusClaim({
      userId,
      paymentId,
      bonusAmount,
    })

    return NextResponse.json({
      success: true,
      message: "Bonus claimed successfully 🎉",
      bonus: bonusAmount,
    })
  } catch (err) {
    console.error("❌ Bonus claim error:", err)

    return NextResponse.json(
      { success: false, error: "Claim failed" },
      { status: 500 }
    )
  }
}
