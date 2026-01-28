import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");

  if (!uid) return Response.json({ error: "uid required" }, { status: 400 });

  const existing = await db.query(
    `SELECT uid FROM wallets WHERE uid = $1 LIMIT 1`,
    [uid]
  );

  if (existing.rows.length === 0) {
    await db.query(
      `INSERT INTO wallets(uid, balance) VALUES ($1, 0)`,
      [uid]
    );
  }

  const wallet = await db.query(
    `SELECT uid, balance, created_at, updated_at FROM wallets WHERE uid = $1`,
    [uid]
  );

  return Response.json(wallet.rows[0], { status: 200 });
}
