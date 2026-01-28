import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const streamId = params.id;

  try {

    const supportersQuery = `
      SELECT t.user_id, u.username, SUM(t.amount) AS total
      FROM transactions t
      JOIN users u ON u.id = t.user_id
      WHERE t.stream_id = $1 AND t.currency = 'GIFT'
      GROUP BY t.user_id, u.username
      ORDER BY total DESC
      LIMIT 20;
    `;

    const coinsQuery = `
      SELECT t.user_id, u.username, SUM(t.amount) AS total
      FROM transactions t
      JOIN users u ON u.id = t.user_id
      WHERE t.stream_id = $1 AND t.currency = 'COIN'
      GROUP BY t.user_id, u.username
      ORDER BY total DESC
      LIMIT 20;
    `;

    const supporters = await db.query(supportersQuery, [streamId]);
    const coins = await db.query(coinsQuery, [streamId]);

    return NextResponse.json({
      supporters: supporters.rows ?? supporters,
      coins: coins.rows ?? coins,
    });

  } catch (err: any) {
    console.error("Leaderboard error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
