import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  const client = await db.connect()

  try {
    const { uid, username } = await req.json()

    if (!uid) {
      return NextResponse.json(
        { success: false, error: "uid required" },
        { status: 400 }
      )
    }

    await client.query("BEGIN")

    // =========================================
    // 1. Cari user berdasarkan UID Pi
    // =========================================
    const userRes = await client.query(
      `
      SELECT *
      FROM users
      WHERE uid=$1
      LIMIT 1
      FOR UPDATE
      `,
      [uid]
    )

    let user = userRes.rows[0]
    let bonusCoins = 0

    // =========================================
    // 2. Jika user baru → create + bonus tier
    // =========================================
    if (!user) {
      const counterRes = await client.query(
        `
        UPDATE login_counter
        SET current_value = current_value + 1
        WHERE id=1
        RETURNING current_value
        `
      )

      const loginOrder = counterRes.rows[0].current_value

      let role = "VIEWER"

      if (loginOrder >= 1 && loginOrder <= 20) {
        bonusCoins = 5000
        role = "HOST"
      } else if (loginOrder >= 21 && loginOrder <= 100) {
        bonusCoins = 500
        role = "HOST"
      }

      const createRes = await client.query(
        `
        INSERT INTO users (
          uid,
          username,
          role,
          coin_balance,
          login_order
        )
        VALUES ($1,$2,$3,$4,$5)
        RETURNING *
        `,
        [uid, username || "Pioneer", role, bonusCoins, loginOrder]
      )

      user = createRes.rows[0]

      await client.query(
        `
        INSERT INTO login_bonus_claims (user_id, bonus_amount)
        VALUES ($1,$2)
        `,
        [user.id, bonusCoins]
      )
    }

    await client.query("COMMIT")

    // =========================================
    // ✅ ALWAYS RETURN UPDATED USER BALANCE
    // =========================================
    const finalUserRes = await db.query(
      `
      SELECT id, uid, username, role,
             coin_balance, login_order
      FROM users
      WHERE uid=$1
      LIMIT 1
      `,
      [uid]
    )

    return NextResponse.json({
      success: true,
      user: finalUserRes.rows[0],
      bonus_awarded: bonusCoins,
    })
  } catch (err) {
    await client.query("ROLLBACK")

    console.error("❌ /me error:", err)

    return NextResponse.json(
      { success: false, error: "Failed login process" },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
