import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const hostKey = body.hostId
    const hostUsername = body.hostUsername
    const coinAmountRaw = body.coinAmount

    if (!hostKey || !hostUsername || coinAmountRaw === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "hostId, hostUsername, coinAmount required",
        },
        { status: 400 }
      )
    }

    // ✅ Force number conversion
    const coinAmount = Number(coinAmountRaw)

    if (isNaN(coinAmount) || coinAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "coinAmount must be a positive number",
        },
        { status: 400 }
      )
    }

    // ============================
    // ✅ Load host (support id OR uid)
    // ============================
    const userRes = await db.query(
      `
      SELECT id, uid, coin_balance
      FROM users
      WHERE id=$1 OR uid=$1
      LIMIT 1
      `,
      [hostKey]
    )

    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Host not found" },
        { status: 404 }
      )
    }

    const host = userRes.rows[0]
    const balance = Number(host.coin_balance)

    if (balance < coinAmount) {
      return NextResponse.json(
        { success: false, error: "Not enough coins" },
        { status: 400 }
      )
    }

    // ============================
    // ✅ Conversion Rule (configurable later)
    // ============================
    const platformFeePercent = 10
    const piRate = 314159

    const feeCoins = Math.floor((coinAmount * platformFeePercent) / 100)
    const netCoins = coinAmount - feeCoins

    const piAmount = coinAmount / piRate
    const netPi = netCoins / piRate

    // ============================
    // ✅ Insert Withdrawal (pending)
    // ============================
    const withdrawalRes = await db.query(
      `
      INSERT INTO withdrawals (
        host_id,
        host_uid,
        host_username,
        coin_amount,
        pi_amount,
        platform_fee_percentage,
        platform_fee_coins,
        net_pi_amount,
        status,
        requested_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending',NOW())
      RETURNING *
      `,
      [
        host.id,
        host.uid,
        hostUsername,
        coinAmount,
        piAmount,
        platformFeePercent,
        feeCoins,
        netPi,
      ]
    )

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted (pending)",
      withdrawal: withdrawalRes.rows[0],
    })
  } catch (err: any) {
    console.error("❌ Withdrawal Request Error:", err)

    return NextResponse.json(
      { success: false, error: err.message || "Withdraw request failed" },
      { status: 500 }
    )
  }
}
