import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      )
    }

    // ============================
    // ✅ Fetch coin_balance from DB
    // ============================
    const res = await db.query(
      `
      SELECT coin_balance
      FROM users
      WHERE id=$1
      LIMIT 1
      `,
      [userId]
    )

    if (res.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      balance: res.rows[0].coin_balance,
    })
  } catch (err) {
    console.error("❌ COIN FETCH ERROR:", err)

    return NextResponse.json(
      { success: false, error: "Failed to fetch coin balance" },
      { status: 500 }
    )
  }
}
