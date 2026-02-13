import { db } from "@/lib/db"

// ============================
// ✅ Check Last Claim
// ============================
export async function getLastBonusClaim(userId: string) {
  const res = await db.query(
    `
    SELECT * FROM login_bonus_claims
    WHERE user_id=$1
    ORDER BY claimed_at DESC
    LIMIT 1
    `,
    [userId]
  )

  return res.rows[0]
}

// ============================
// ✅ Save Bonus Claim
// ============================
export async function saveBonusClaim({
  userId,
  paymentId,
  bonusAmount,
}: {
  userId: string
  paymentId: string
  bonusAmount: number
}) {
  await db.query(
    `
    INSERT INTO login_bonus_claims (user_id, payment_id, bonus_amount)
    VALUES ($1, $2, $3)
    `,
    [userId, paymentId, bonusAmount]
  )
}
