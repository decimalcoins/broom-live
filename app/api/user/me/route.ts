import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyPiToken } from "@/lib/pi/verify-token"

export async function GET(req: Request) {
  const client = await db.connect()

  try {
    // ============================
    // ✅ ACCESS TOKEN REQUIRED
    // ============================
    const accessToken =
      req.headers.get("Authorization")?.replace("Bearer ", "") || null

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "Missing Pi Access Token" },
        { status: 401 }
      )
    }

    // ============================
    // ✅ VERIFY TOKEN TO PI SERVER
    // ============================
    const piUser = await verifyPiToken(accessToken)

    if (!piUser?.uid) {
      return NextResponse.json(
        { success: false, error: "Invalid Pi Token" },
        { status: 401 }
      )
    }

    const uid = piUser.uid
    const username = piUser.username

    // ============================
    // ✅ CHECK USER EXISTS
    // ============================
    const userRes = await client.query(
      `
      SELECT *
      FROM users
      WHERE id=$1
      LIMIT 1
      `,
      [uid]
    )

    // ============================
    // ✅ USER EXISTS → RETURN
    // ============================
    if (userRes.rows.length > 0) {
      return NextResponse.json({
        success: true,
        user: userRes.rows[0],
      })
    }

    // ============================
    // ✅ NEW USER → CREATE
    // ============================

    // login_order auto increment
    const orderRes = await client.query(
      `SELECT COUNT(*)::int AS total FROM users`
    )

    const loginOrder = orderRes.rows[0].total + 1

    const newUserRes = await client.query(
      `
      INSERT INTO users (
        id,
        username,
        role,
        coin_balance,
        pi_balance,
        login_order,
        created_at,
        updated_at
      )
      VALUES (
        $1,
        $2,
        'viewer',
        0,
        0,
        $3,
        NOW(),
        NOW()
      )
      RETURNING *
      `,
      [uid, username, loginOrder]
    )

    return NextResponse.json({
      success: true,
      message: "New Pi user created",
      user: newUserRes.rows[0],
    })
  } catch (err: any) {
    console.error("❌ /api/user/me ERROR:", err)

    return NextResponse.json(
      { success: false, error: err.message || "User fetch failed" },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
