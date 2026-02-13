import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  const client = await db.connect()

  try {
    const { streamId, senderId, giftAmount } = await req.json()

    if (!streamId || !senderId || !giftAmount) {
      return NextResponse.json(
        { success: false, error: "streamId, senderId, giftAmount required" },
        { status: 400 }
      )
    }

    if (giftAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid gift amount" },
        { status: 400 }
      )
    }

    await client.query("BEGIN")

    // ============================
    // ✅ CHECK STREAM LIVE
    // ============================
    const streamRes = await client.query(
      `
      SELECT id, host_id, is_live
      FROM streams
      WHERE id=$1
      FOR UPDATE
      `,
      [streamId]
    )

    const stream = streamRes.rows[0]

    if (!stream) {
      await client.query("ROLLBACK")
      return NextResponse.json(
        { success: false, error: "Stream not found" },
        { status: 404 }
      )
    }

    if (!stream.is_live) {
      await client.query("ROLLBACK")
      return NextResponse.json(
        { success: false, error: "Stream is not live" },
        { status: 400 }
      )
    }

    const hostId = stream.host_id

    // ============================
    // ✅ CHECK VIEWER COIN BALANCE
    // ============================
    const senderRes = await client.query(
      `
      SELECT id, coin_balance
      FROM users
      WHERE id=$1
      FOR UPDATE
      `,
      [senderId]
    )

    const sender = senderRes.rows[0]

    if (!sender) {
      await client.query("ROLLBACK")
      return NextResponse.json(
        { success: false, error: "Sender not found" },
        { status: 404 }
      )
    }

    if (sender.coin_balance < giftAmount) {
      await client.query("ROLLBACK")
      return NextResponse.json(
        { success: false, error: "Not enough coins" },
        { status: 400 }
      )
    }

    // ============================
    // ✅ TRANSFER COINS
    // ============================

    // Viewer - giftAmount
    await client.query(
      `
      UPDATE users
      SET coin_balance = coin_balance - $1
      WHERE id=$2
      `,
      [giftAmount, senderId]
    )

    // Host + giftAmount
    await client.query(
      `
      UPDATE users
      SET coin_balance = coin_balance + $1
      WHERE id=$2
      `,
      [giftAmount, hostId]
    )

    // ============================
    // ✅ INSERT GIFT RECORD
    // ============================
    await client.query(
      `
      INSERT INTO gifts (stream_id, sender_id, host_id, gift_amount)
      VALUES ($1, $2, $3, $4)
      `,
      [streamId, senderId, hostId, giftAmount]
    )

    // ============================
    // ✅ TRANSACTION LOGS
    // ============================

    // Sender transaction
    await client.query(
      `
      INSERT INTO transactions (user_id, type, amount, currency)
      VALUES ($1, 'gift_sent', $2, 'COIN')
      `,
      [senderId, giftAmount]
    )

    // Host transaction
    await client.query(
      `
      INSERT INTO transactions (user_id, type, amount, currency)
      VALUES ($1, 'gift_received', $2, 'COIN')
      `,
      [hostId, giftAmount]
    )

    await client.query("COMMIT")

    return NextResponse.json({
      success: true,
      message: "🎁 Gift sent successfully!",
    })
  } catch (err: any) {
    await client.query("ROLLBACK")

    console.error("❌ GIFT SEND ERROR:", err)

    return NextResponse.json(
      { success: false, error: err.message || "Gift failed" },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
