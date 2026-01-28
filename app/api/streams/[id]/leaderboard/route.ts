import { db } from "@/lib/db";

export async function GET() {
  try {
    const rows = await db.query(`
      SELECT
        u.id,
        u.username,
        'https://api.dicebear.com/7.x/avataaars/svg?seed=' || u.username AS avatar_url,
        SUM(t.amount) AS total
      FROM transactions t
      JOIN users u ON u.id = t.related_user_id
      WHERE t.type = 'gift'
      GROUP BY u.id
      ORDER BY total DESC
      LIMIT 20
    `);

    return Response.json(rows, { status: 200 });
  } catch (err: any) {
    console.error("Leaderboard error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
