import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyPiToken } from "@/lib/pi"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const { pi_auth_token } = await req.json()

    if (!pi_auth_token) {
      return NextResponse.json(
        { success: false, error: "Missing Pi Auth Token" },
        { status: 400 }
      )
    }

    // ✅ Verify Pi Token
    const piUser = await verifyPiToken(pi_auth_token)

    const username = piUser.username
    const uid = piUser.uid

    if (!username || !uid) {
      return NextResponse.json(
        { success: false, error: "Invalid Pi user data" },
        { status: 401 }
      )
    }

    // ✅ Existing user check
    const existing = await db.query(
      `SELECT * FROM users WHERE uid=$1 LIMIT 1`,
      [uid]
    )

    if (existing.rows.length > 0) {
      return NextResponse.json({
        success: true,
        user: existing.rows[0],
        message: "Welcome back!",
      })
    }

    // ✅ Login order counter
    const counterRes = await db.query(
      `
      UPDATE login_counter
      SET current_value = current_value + 1
      WHERE id = 1
      RETURNING current_value
      `
    )

    const loginOrder = counterRes.rows[0].current_value

    // ✅ Bonus + role rules
    let bonusCoin = 0
    let role = "viewer"

    if (loginOrder >= 1 && loginOrder <= 20) {
      bonusCoin = 5000
      role = "host"
    } else if (loginOrder >= 21 && loginOrder <= 100) {
      bonusCoin = 500
      role = "host"
    }

    // ✅ Generate ID manually
    const id = crypto.randomUUID()

    // ✅ Insert user WITH id
    const result = await db.query(
      `
      INSERT INTO users (
        id,
        uid,
        username,
        coin_balance,
        role,
        login_order
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [id, uid, username, bonusCoin, role, loginOrder]
    )

    return NextResponse.json({
      success: true,
      user: result.rows[0],
      loginOrder,
      bonusCoins: bonusCoin,
      role,
      message: "🎉 Account created successfully!",
    })
  } catch (err: any) {
    console.error("❌ LOGIN ERROR:", err)

    return NextResponse.json(
      {
        success: false,
        error: err.message || "Login failed",
      },
      { status: 500 }
    )
  }
}
