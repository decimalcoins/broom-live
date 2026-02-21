import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import crypto from "crypto"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const client = await db.connect()

  try {
    const body = await req.json()

    const hostKey = body.hostId
    const coinAmountRaw = body.coinAmount

    if (!hostKey || coinAmountRaw === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "hostId and coinAmount required",
        },
        { status: 400 }
      )
    }

    const coinAmount = Number(coinAmountRaw)

    if (isNaN(coinAmount) || coinAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "coinAmount must be positive number",
        },
        { status: 400 }
      )
    }

    await client.query("BEGIN")

    // 🔒 Lock user row
    const userRes = await client.query(
      `
      SELECT id, username, coin_balance
      FROM users
      WHERE id=$1 OR uid=$1
      LIMIT 1
      FOR UPDATE
      `,
      [hostKey]
    )

    if (userRes.rows.length === 0) {
      await client.query("ROLLBACK")
      return NextResponse.json(
        { success: false, error: "Host not found" },
        { status: 404 }
      )
    }

    const host = userRes.rows[0]
    const balance = Number(host.coin_balance)

    if (balance < coinAmount) {
      await client.query("ROLLBACK")
      return NextResponse.json(
        { success: false, error: "Not enough coins" },
        { status: 400 }
      )
    }

    // ============================
    // 💰 Conversion Logic
    // ============================
    const platformFeePercent = 10
    const piRate = 314159

    const feeCoins = Math.floor((coinAmount * platformFeePercent) / 100)
    const netCoins = coinAmount - feeCoins

    const piAmount = coinAmount / piRate
    const netPi = netCoins / piRate

    // ============================
    // ➖ Deduct balance immediately
    // ============================
    await client.query(
      `
      UPDATE users
      SET coin_balance = coin_balance - $1
      WHERE id=$2
      `,
      [coinAmount, host.id]
    )

    // ============================
    // 📝 Insert withdrawal (NO host_uid)
    // ============================
    const withdrawalRes = await client.query(
      `
      INSERT INTO withdrawals (
        id,
        host_id,
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
        crypto.randomUUID(),
        host.id,
        host.username, // ambil dari DB, bukan dari client
        coinAmount,
        piAmount,
        platformFeePercent,
        feeCoins,
        netPi,
      ]
    )

    await client.query("COMMIT")

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted (pending)",
      withdrawal: withdrawalRes.rows[0],
    })
  } catch (err: any) {
    await client.query("ROLLBACK")
    console.error("❌ Withdrawal Request Error:", err)

    return NextResponse.json(
      { success: false, error: err.message || "Withdraw request failed" },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}