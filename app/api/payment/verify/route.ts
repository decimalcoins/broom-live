import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const RATE = 314159; // sesuai GCV kamu

export async function POST(req: NextRequest) {
  const { paymentId, uid, pi_confirmed } = await req.json();

  const result = await db.query(`SELECT * FROM payments WHERE id = $1`, [paymentId]);
  const payment = result.rows[0];

  if (!payment || payment.status !== 'pending') {
    return NextResponse.json({ error: "invalid or already processed" }, { status: 400 });
  }

  const coin = Number(pi_confirmed) * RATE;

  await db.query(`UPDATE payments SET coin_amount = $1, status = 'success' WHERE id = $2`, [coin, paymentId]);
  await db.query(`UPDATE wallets SET balance_coin = balance_coin + $1 WHERE uid = $2`, [coin, uid]);

  await db.query(`
    INSERT INTO transactions (id, user_id, type, amount, currency)
    VALUES ($1, $2, 'topup', $3, 'coin')
  `, [paymentId, uid, coin]);

  return NextResponse.json({
    status: "credited",
    coin_amount: coin
  });
}
