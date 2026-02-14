import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { uid } = await req.json()

    if (!uid) {
      return NextResponse.json(
        { success: false, error: "uid required" },
        { status: 400 }
      )
    }

    // ============================
    // 1. Cari user
    // ============================
    const res = await db.query(
      `
      SELECT *
      FROM users
      WHERE uid=$1
      LIMIT 1
      `,
      [uid]
    )

    let user = res.rows[0]

    // ============================
    // 2. Kalau user belum ada → create
    // ============================
    if (!user) {
      const createRes = await db.query(
        `
        INSERT INTO users (uid, username, role, coin_balance, login_order)
        VALUES ($1, $2, 'USER', 0, 0)
        RETURNING *
        `,
        [uid, "Pioneer"]
      )

      user = createRes.rows[0]
    }

    // ============================
    // 3. Auto increment login_order
    // ============================
    const updatedLogin = await db.query(
      `
      UPDATE users
      SET login_order = login_order + 1
      WHERE id=$1
      RETURNING login_order
      `,
      [user.id]
    )

    user.login_order = updatedLogin.rows[0].login_order

    // ============================
    // 4. AUTO HOST UNLOCK (Login 1–100)
    // ============================
    if (user.login_order <= 100 && user.role !== "HOST") {
      console.log("🔥 Auto unlock host for:", user.username)

      // Bonus coins
      const bonusCoins = 50000

      const hostRes = await db.query(
        `
        UPDATE users
        SET role='HOST',
            coin_balance = coin_balance + $1
        WHERE id=$2
        RETURNING *
        `,
        [bonusCoins, user.id]
      )

      user = hostRes.rows[0]
    }

    // ============================
    // 5. Return
    // ============================
    return NextResponse.json({
      success: true,
      user,
      can_host: user.role === "HOST",
    })
  } catch (err) {
    console.error("❌ /me error:", err)

    return NextResponse.json(
      { success: false, error: "Failed to load user" },
      { status: 500 }
    )
  }
}
