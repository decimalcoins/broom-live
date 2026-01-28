import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { uid, pi_amount } = await req.json();

  if (!uid || !pi_amount) {
    return NextResponse.json({ error: "uid & pi_amount required" }, { status: 400 });
  }

  const paymentId = randomUUID();

  await db.query(`
    INSERT INTO payments (id, user_id, pi_amount, coin_amount, status)
    VALUES ($1, $2, $3, 0, 'pending')
  `, [paymentId, uid, pi_amount]);

  return NextResponse.json({
    paymentId,
    uid,
    pi_amount
  });
}
