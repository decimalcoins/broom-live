import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { streamId, senderId, hostId, giftId } = body

    if (!streamId || !senderId || !hostId || !giftId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // ================================
    // 1. Load Gift Info
    // ================================
    const giftRes = await db.query(
      `
      SELECT id, name, coin_cost, image_url
      FROM gifts
      WHERE id=$1
      LIMIT 1
      `,
      [giftId]
    )

    const gift = giftRes.rows[0]

    if (!gift) {
      return NextResponse.json(
        { success: false, error: "Gift not found" },
        { status: 404 }
      )
    }

    const cost = gift.coin_cost

    // ================================
    // 2. Check Sender Coin Balance
    // ================================
    const senderRes = await db.query(
      `
      SELECT id, username, coin_balance
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

    if (sender.coin_balance < cost) {
      return NextResponse.json(
        { success: false, error: "Not enough coins" },
        { status: 400 }
      )
    }

    // ================================
    // 3. Deduct Coins from Viewer
    // ================================
    await db.query(
      `
      UPDATE users
      SET coin_balance = coin_balance - $1
      WHERE id=$2
      `,
      [cost, senderId]
    )

    // ================================
    // 4. Add Coins to Host
    // ================================
    await db.query(
      `
      UPDATE users
      SET coin_balance = coin_balance + $1
      WHERE id=$2
      `,
      [cost, hostId]
    )

    // ================================
    // 5. Insert Gift Event
    // ================================
    const eventRes = await db.query(
      `
      INSERT INTO gift_events (
        stream_id,
        sender_id,
        host_id,
        gift_id,
        coin_amount
      )
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *
      `,
      [streamId, senderId, hostId, giftId, cost]
    )

    const giftEvent = eventRes.rows[0]

    // ================================
    // 6. Insert Transactions
    // ================================

    // Sender transaction (spent)
    await db.query(
      `
      INSERT INTO transactions (user_id, type, amount, currency)
      VALUES ($1,'gift_sent',$2,'COIN')
      `,
      [senderId, cost]
    )

    // Host transaction (earned)
    await db.query(
      `
      INSERT INTO transactions (user_id, type, amount, currency)
      VALUES ($1,'gift_received',$2,'COIN')
      `,
      [hostId, cost]
    )

    // ================================
    // 7. Return Response
    // ================================
    return NextResponse.json({
      success: true,
      message: "Gift sent successfully",
      data: {
        id: giftEvent.id,
        stream_id: streamId,
        sender_username: sender.username,
        gift: {
          id: gift.id,
          name: gift.name,
          coin_cost: cost,
          image_url: gift.image_url,
        },
      },
    })
  } catch (err) {
    console.error("❌ SEND GIFT ERROR:", err)

    return NextResponse.json(
      { success: false, error: "Failed to send gift" },
      { status: 500 }
    )
  }
}
