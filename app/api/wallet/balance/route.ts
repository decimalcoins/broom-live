import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");

  if (!uid) {
    return Response.json({ error: "uid required" }, { status: 400 });
  }

  const result = await db.query(
    `SELECT uid, balance, updated_at FROM wallets WHERE uid = $1 LIMIT 1`,
    [uid]
  );

  if (result.rows.length === 0) {
    return Response.json({ error: "wallet not found" }, { status: 404 });
  }

  return Response.json(result.rows[0], { status: 200 });
}
