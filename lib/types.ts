// ============================
// USER TYPES
// ============================
export type UserRole = "VIEWER" | "HOST" | "ADMIN"

export interface User {
  id: string
  uid: string
  username: string
  role: UserRole
  coin_balance: number
  login_order: number
  created_at: string
}

// ============================
// STREAM TYPES
// ============================
export interface Stream {
  id: string

  host_id: string
  host_uid: string   // ✅ FIX penting

  host_username: string

  title: string
  description: string | null

  is_live: boolean
  viewer_count: number

  started_at: string | null
  ended_at: string | null

  thumbnail_url?: string | null
}

// ============================
// GIFT TYPES
// ============================
export interface Gift {
  id: string
  name: string
  coin_cost: number
  image_url: string
}

// ============================
// TRANSACTION TYPES
// ============================
export type TransactionType =
  | "coin_purchase"
  | "gift_sent"
  | "gift_received"
  | "withdrawal"

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  currency: "coins" | "pi"
  created_at: string
}

// ============================
// WITHDRAWAL TYPES
// ============================
export type WithdrawalStatus = "pending" | "approved" | "rejected"

export interface Withdrawal {
  id: string
  host_id: string
  host_username: string
  coin_amount: number
  pi_amount: number
  status: WithdrawalStatus
  requested_at: string
}
