import { db } from "../db";

export async function getWallet(uid: string) {
  const result = await db.query(
    `SELECT uid, balance, updated_at, created_at FROM wallets WHERE uid = $1 LIMIT 1`,
    [uid]
  );

  return result.rows[0] ?? null;
}
