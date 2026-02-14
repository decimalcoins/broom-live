import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import crypto from "crypto"

export async function POST(req: Request) {
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

    // ============================
    // ✅ CHECK STREAM LIVE
    // ============================
    const streamRes = await db.query(
      `
      SELECT id, host_id, is_live
      FROM streams
      WHERE id=$1
      LIMIT 1
      `,
      [streamId]
    )

    const stream = streamRes.rows[0]

    if (!stream) {
      return NextResponse.json(
        { success: false, error: "Stream not found" },
        { status: 404 }
      )
    }

    if (!stream.is_live) {
      return NextResponse.json(
        { success: false, error: "Stream is not live" },
        { status: 400 }
      )
    }

    const hostId = stream.host_id

    // ============================
    // ✅ CHECK VIEWER BALANCE
    // ============================
    const senderRes = await db.query(
      `
      SELECT id, coin_balance
      FROM users
      WHERE id=$1
      LIMIT 1
      `,
      [senderId]
    )

    const sender = senderRes.rows[0]

    if (!sender) {
      return NextResponse.json(
        { success: false, error: "Sender not found" },
        { status: 404 }
      )
    }

    if (sender.coin_balance < giftAmount) {
      return NextResponse.json(
        { success: false, error: "Not enough coins" },
        { status: 400 }
      )
    }

    // ============================
    // ✅ ATOMIC TRANSFER
    // ============================
    await db.query("BEGIN")

    // Deduct sender coins
    await db.query(
      `
      UPDATE users
      SET coin_balance = coin_balance - $1
      WHERE id=$2
      `,
      [giftAmount, senderId]
    )

    // Add host coins
    await db.query(
      `
      UPDATE users
      SET coin_balance = coin_balance + $1
      WHERE id=$2
      `,
      [giftAmount, hostId]
    )

    // ============================
    // ✅ TRANSACTION LOG (Sender)
    // ============================
    const txSenderId = crypto.randomUUID()

    await db.query(
      `
      INSERT INTO transactions (
        id,
        user_id,
        type,
        amount,
        currency,
        related_user_id,
        stream_id,
        created_at
      )
      VALUES ($1,$2,'gift_sent',$3,'coin',$4,$5,NOW())
      `,
      [txSenderId, senderId, giftAmount, hostId, streamId]
    )

    // ============================
    // ✅ TRANSACTION LOG (Host)
    // ============================
    const txHostId = crypto.randomUUID()

    await db.query(
      `
      INSERT INTO transactions (
        id,
        user_id,
        type,
        amount,
        currency,
        related_user_id,
        stream_id,
        created_at
      )
      VALUES ($1,$2,'gift_received',$3,'coin',$4,$5,NOW())
      `,
      [txHostId, hostId, giftAmount, senderId, streamId]
    )

    await db.query("COMMIT")

    return NextResponse.json({
      success: true,
      message: "🎁 Gift sent successfully!",
    })
  } catch (err: any) {
    await db.query("ROLLBACK")

    console.error("❌ GIFT SEND ERROR:", err)

    return NextResponse.json(
      { success: false, error: err.message || "Gift failed" },
      { status: 500 }
    )
  }
}
