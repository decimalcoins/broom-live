import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userKey = params.id

    if (!userKey) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      )
    }

    // ✅ Support ID or UID
    const userRes = await db.query(
      `
      SELECT id, uid
      FROM users
      WHERE id=$1 OR uid=$1
      LIMIT 1
      `,
      [userKey]
    )

    const user = userRes.rows[0]

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    // ✅ Get Transactions
    const txRes = await db.query(
      `
      SELECT *
      FROM transactions
      WHERE user_id=$1
      ORDER BY created_at DESC
      LIMIT 50
      `,
      [user.id]
    )

    return NextResponse.json({
      success: true,
      transactions: txRes.rows,
    })
  } catch (err: any) {
    console.error("❌ TRANSACTIONS ERROR:", err)

    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 }
    )
  }
}
