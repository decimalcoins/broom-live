import { db } from "@/lib/db"

// ============================
// ✅ SAVE PAYMENT (APPROVE STEP)
// ============================
export async function savePayment({
  paymentId,
  userId,
  amount,
  status = "APPROVED",
}: {
  paymentId: string
  userId: string
  amount: number
  status?: "APPROVED" | "COMPLETED"
}) {
  await db.query(
    `
    INSERT INTO payments (payment_id, user_id, amount, status)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (payment_id)
    DO UPDATE SET status=$4
    `,
    [paymentId, userId, amount, status]
  )
}

// ============================
// ✅ COMPLETE PAYMENT
// ============================
export async function completePayment({
  paymentId,
  txid,
  status = "COMPLETED",
}: {
  paymentId: string
  txid: string
  status?: "COMPLETED"
}) {
  await db.query(
    `
    UPDATE payments
    SET status=$2,
        txid=$3
    WHERE payment_id=$1
    `,
    [paymentId, status, txid]
  )
}

// ============================
// ✅ GRANT HOST REWARD AFTER PAYMENT
// ============================
export async function grantHostRewards({
  userId,
  coinBonus,
}: {
  userId: string
  coinBonus: number
}) {
  await db.query(
    `
    UPDATE users
    SET role='HOST',
        coin_balance = coin_balance + $2
    WHERE id=$1
    `,
    [userId, coinBonus]
  )
}

// ============================
// ✅ GET PAYMENT
// ============================
export async function getPayment(paymentId: string) {
  const res = await db.query(
    `
    SELECT *
    FROM payments
    WHERE payment_id=$1
    LIMIT 1
    `,
    [paymentId]
  )

  return res.rows[0]
}
