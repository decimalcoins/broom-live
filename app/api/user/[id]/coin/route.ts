import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ FIX: params harus di-await
    const { id } = await context.params

    if (!id) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      )
    }

    // ============================
    // ✅ Support id atau uid
    // ============================
    const res = await db.query(
      `
      SELECT id, uid, username, coin_balance
      FROM users
      WHERE id=$1 OR uid=$1
      LIMIT 1
      `,
      [id]
    )

    if (res.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      balance: Number(res.rows[0].coin_balance),
      user: res.rows[0],
    })
  } catch (err) {
    console.error("❌ COIN FETCH ERROR:", err)

    return NextResponse.json(
      { success: false, error: "Failed to fetch coin balance" },
      { status: 500 }
    )
  }
}
