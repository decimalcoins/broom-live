import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyPiToken } from "@/lib/pi"

export async function POST(req: Request) {
  try {
    const { pi_auth_token } = await req.json()

    if (!pi_auth_token) {
      return NextResponse.json(
        { success: false, error: "Missing Pi Auth Token" },
        { status: 400 }
      )
    }

    // ============================
    // ✅ VERIFY TOKEN TO PI SERVER
    // ============================
    const piUser = await verifyPiToken(pi_auth_token)

    const username = piUser.username
    const uid = piUser.uid

    if (!username || !uid) {
      return NextResponse.json(
        { success: false, error: "Invalid Pi user data" },
        { status: 401 }
      )
    }

    // ============================
    // ✅ CHECK EXISTING USER
    // ============================
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

    // ============================
    // ✅ NEW USER REGISTRATION
    // ============================

    // ✅ ATOMIC LOGIN ORDER COUNTER
    const counterRes = await db.query(
      `
      UPDATE login_counter
      SET current_value = current_value + 1
      WHERE id = 1
      RETURNING current_value
      `
    )

    const loginOrder = counterRes.rows[0].current_value

    // ============================
    // ✅ BONUS + ROLE RULES
    // ============================
    let bonusCoin = 0
    let role = "viewer"

    if (loginOrder >= 1 && loginOrder <= 20) {
      bonusCoin = 5000
      role = "host"
    } else if (loginOrder >= 21 && loginOrder <= 100) {
      bonusCoin = 500
      role = "host"
    }

    // ============================
    // ✅ INSERT USER INTO DATABASE
    // ============================
    const result = await db.query(
      `
      INSERT INTO users (
        uid,
        username,
        coin_balance,
        role,
        login_order
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [uid, username, bonusCoin, role, loginOrder]
    )

    return NextResponse.json({
      success: true,
      user: result.rows[0],
      loginOrder,
      bonusCoins: bonusCoin,
      role,
      message:
        loginOrder <= 100
          ? "🎉 Congrats! You are now a HOST!"
          : "Welcome! Viewer access only.",
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
