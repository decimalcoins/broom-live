import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { hostId, hostUsername, coinAmount } = await req.json()

    if (!hostId || !hostUsername || !coinAmount) {
      return NextResponse.json(
        {
          success: false,
          error: "hostId, hostUsername, coinAmount required",
        },
        { status: 400 }
      )
    }

    // ============================
    // ✅ Check host balance
    // ============================
    const userRes = await db.query(
      `SELECT coin_balance FROM users WHERE id=$1`,
      [hostId]
    )

    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Host not found" },
        { status: 404 }
      )
    }

    const balance = Number(userRes.rows[0].coin_balance)

    if (balance < coinAmount) {
      return NextResponse.json(
        { success: false, error: "Not enough coins" },
        { status: 400 }
      )
    }

    // ============================
    // ✅ Conversion Rule
    // ============================
    const platformFeePercent = 10
    const piRate = 314159

    const piAmount = coinAmount / piRate
    const feeCoins = Math.floor((coinAmount * platformFeePercent) / 100)
    const netCoins = coinAmount - feeCoins
    const netPi = netCoins / piRate

    // ============================
    // ✅ Insert Withdrawal (PENDING ONLY)
    // ============================
    const withdrawalRes = await db.query(
      `
      INSERT INTO withdrawals
      (host_id, host_username,
       coin_amount, pi_amount,
       platform_fee_percentage,
       platform_fee_coins,
       net_pi_amount,
       status,
       requested_at)
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,'pending',NOW())
      RETURNING *
      `,
      [
        hostId,
        hostUsername,
        coinAmount,
        piAmount,
        platformFeePercent,
        feeCoins,
        netPi,
      ]
    )

    // ❌ NO coin deduction yet (manual approve later)

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted (pending)",
      withdrawal: withdrawalRes.rows[0],
    })
  } catch (err) {
    console.error("❌ Withdrawal Request Error:", err)

    return NextResponse.json(
      { success: false, error: "Withdraw request failed" },
      { status: 500 }
    )
  }
}
