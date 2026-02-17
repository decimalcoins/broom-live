import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyPiToken } from "@/lib/pi"

export async function POST(req: Request) {
  const client = await db.connect()

  try {
    const { pi_auth_token } = await req.json()

    if (!pi_auth_token) {
      return NextResponse.json(
        { success: false, error: "Missing Pi Auth Token" },
        { status: 400 }
      )
    }

    // =========================================
    // ✅ 1. Verify Pioneer Identity via Pi API
    // =========================================
    const pioneer = await verifyPiToken(pi_auth_token)

    if (!pioneer?.uid) {
      return NextResponse.json(
        { success: false, error: "Invalid Pi Token" },
        { status: 401 }
      )
    }

    const uid = pioneer.uid
    const username = pioneer.username || "Pioneer"

    await client.query("BEGIN")

    // =========================================
    // 2. Cari user berdasarkan UID Pi
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
    // 3. Jika user baru → create + bonus tier
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
        [uid, username, role, bonusCoins, loginOrder]
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
    // ✅ 4. Return final updated user (safe)
    // =========================================
    const finalUserRes = await client.query(
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
