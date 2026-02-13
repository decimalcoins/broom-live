import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  const client = await db.connect()

  try {
    const { userId } = await req.json()

    // ============================
    // ✅ Start Transaction
    // ============================
    await client.query("BEGIN")

    // ============================
    // 1. Lock user row
    // ============================
    const userRes = await client.query(
      `
      SELECT id, login_order, role
      FROM users
      WHERE id=$1
      FOR UPDATE
      `,
      [userId]
    )

    const user = userRes.rows[0]

    if (!user) {
      await client.query("ROLLBACK")
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    // Kalau sudah pernah dapat login_order → stop
    if (user.login_order && user.login_order > 0) {
      await client.query("ROLLBACK")

      return NextResponse.json({
        success: true,
        message: "Reward already assigned",
        login_order: user.login_order,
        role: user.role,
      })
    }

    // ============================
    // 2. Lock counter row + increment
    // ============================
    const counterRes = await client.query(
      `
      UPDATE login_counter
      SET current_value = current_value + 1
      WHERE id = 1
      RETURNING current_value
      `
    )

    const loginOrder = counterRes.rows[0].current_value

    // ============================
    // 3. Tentukan reward + role
    // ============================
    let bonusCoin = 0
    let newRole = "USER"

    if (loginOrder >= 1 && loginOrder <= 20) {
      bonusCoin = 5000
      newRole = "HOST"
    } else if (loginOrder >= 21 && loginOrder <= 100) {
      bonusCoin = 500
      newRole = "HOST"
    }

    // ============================
    // 4. Update user
    // ============================
    await client.query(
      `
      UPDATE users
      SET login_order=$1,
          role=$2,
          coin_balance = coin_balance + $3
      WHERE id=$4
      `,
      [loginOrder, newRole, bonusCoin, userId]
    )

    // ============================
    // ✅ Commit Transaction
    // ============================
    await client.query("COMMIT")

    return NextResponse.json({
      success: true,
      message:
        loginOrder <= 100
          ? "🎉 Congrats! You are now a Host!"
          : "Login recorded. Viewer access only.",
      login_order: loginOrder,
      role: newRole,
      bonus_coin: bonusCoin,
    })
  } catch (err) {
    await client.query("ROLLBACK")

    console.error("❌ Atomic login reward error:", err)

    return NextResponse.json(
      { success: false, error: "Reward assignment failed" },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
