import { db } from "@/lib/db"

// ============================
// ✅ SAVE PAYMENT
// ============================
export async function savePayment({
  paymentId,
  userId,
  amount,
}: {
  paymentId: string
  userId: string
  amount: number
}) {
  await db.query(
    `
    INSERT INTO payments (payment_id, user_id, amount, status)
    VALUES ($1, $2, $3, 'APPROVED')
    ON CONFLICT (payment_id) DO NOTHING
    `,
    [paymentId, userId, amount]
  )
}

// ============================
// ✅ COMPLETE PAYMENT
// ============================
export async function completePayment({
  paymentId,
  txid,
}: {
  paymentId: string
  txid: string
}) {
  await db.query(
    `
    UPDATE payments
    SET status='COMPLETED', txid=$2
    WHERE payment_id=$1
    `,
    [paymentId, txid]
  )
}

// ============================
// ✅ GET PAYMENT
// ============================
export async function getPayment(paymentId: string) {
  const res = await db.query(
    `
    SELECT * FROM payments
    WHERE payment_id=$1
    LIMIT 1
    `,
    [paymentId]
  )

  return res.rows[0]
}
