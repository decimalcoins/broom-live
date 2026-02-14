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
    // 2. Jika user BARU → buat akun + bonus sekali
    // =========================================
    if (!user) {
      // ✅ login_order pakai login_counter (aman)
      const counterRes = await client.query(
        `
        UPDATE login_counter
        SET current_value = current_value + 1
        WHERE id=1
        RETURNING current_value
        `
      )

      const loginOrder = counterRes.rows[0].current_value

      // =========================================
      // Tentukan bonus tier
      // =========================================
      let role = "VIEWER"

      if (loginOrder >= 1 && loginOrder <= 20) {
        bonusCoins = 5000
        role = "HOST"
      } else if (loginOrder >= 21 && loginOrder <= 100) {
        bonusCoins = 500
        role = "HOST"
      }

      // =========================================
      // Create user langsung dengan role final
      // =========================================
      const createRes = await client.query(
        `
        INSERT INTO users (
          uid,
          username,
          role,
          coin_balance,
          login_order
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
          uid,
          username || "Pioneer",
          role,
          bonusCoins,
          loginOrder,
        ]
      )

      user = createRes.rows[0]

      // =========================================
      // Simpan bonus claim record (sekali seumur hidup)
      // =========================================
      await client.query(
        `
        INSERT INTO login_bonus_claims (user_id, bonus_amount)
        VALUES ($1, $2)
        `,
        [user.id, bonusCoins]
      )
    }

    await client.query("COMMIT")

    // =========================================
    // 3. Return user final
    // =========================================
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        uid: user.uid,
        username: user.username,
        role: user.role,
        coin_balance: user.coin_balance,
        login_order: user.login_order,
      },
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
