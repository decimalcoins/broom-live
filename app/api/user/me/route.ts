import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyPiToken } from "@/lib/pi"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

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
    // 1. Verify Pioneer Identity
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
    // 2. Check Existing User
    // =========================================
    const userRes = await client.query(
      `
      SELECT id, uid, username, role, coin_balance, login_order
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
    // 3. New User → Assign Tier Reward
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

      // 🎁 Tier Bonus Logic
      if (loginOrder >= 1 && loginOrder <= 20) {
        role = "HOST"
        bonusCoins = 5000
      } else if (loginOrder >= 21 && loginOrder <= 100) {
        role = "HOST"
        bonusCoins = 500
      }

      // Create User
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
        RETURNING id, uid, username, role, coin_balance, login_order
        `,
        [uid, username, role, bonusCoins, loginOrder]
      )

      user = createRes.rows[0]

      // Save bonus history
      if (bonusCoins > 0) {
        await client.query(
          `
          INSERT INTO login_bonus_claims (user_id, bonus_amount)
          VALUES ($1,$2)
          `,
          [user.id, bonusCoins]
        )
      }
    }

    await client.query("COMMIT")

    // =========================================
    // 4. Return Final User Data
    // =========================================
    return NextResponse.json({
      success: true,
      user,
      bonus_awarded: bonusCoins,
    })
  } catch (err: any) {
    await client.query("ROLLBACK")

    console.error("❌ /me error:", err)

    return NextResponse.json(
      { success: false, error: err.message || "Login failed" },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
