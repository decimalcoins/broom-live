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

    // Cari user berdasarkan uid Pi
    const res = await db.query(
      `
      SELECT id, uid, username, role, login_order,
             coin_balance, pi_balance
      FROM users
      WHERE uid=$1
      LIMIT 1
      `,
      [uid]
    )

    let user = res.rows[0]

    // Kalau user belum ada → create otomatis
    if (!user) {
      const createRes = await db.query(
        `
        INSERT INTO users (uid, username, role, coin_balance, pi_balance, login_order)
        VALUES ($1, $2, 'USER', 0, 0, 0)
        RETURNING *
        `,
        [uid, "Pioneer"]
      )

      user = createRes.rows[0]
    }

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
