// ============================
// USER TYPES
// ============================

export type UserRole = "viewer" | "host" | "admin"

export interface User {
  id: string
  uid: string // ✅ IMPORTANT for LiveKit room
  username: string
  role: UserRole
  coin_balance: number
  pi_balance: number
  login_order: number
  created_at: string
}

// ============================
// STREAM TYPES
// ============================

export interface Stream {
  id: string

  host_id: string
  host_uid: string // ✅ FIX (room key)
  host_username: string

  title: string
  description: string

  is_live: boolean
  viewer_count: number

  started_at: string | null
  ended_at: string | null

  thumbnail_url?: string
}

// ============================
// GIFT TYPES
// ============================

export interface Gift {
  id: string
  name: string
  coin_cost: number
  image_url: string
  animation_url?: string
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
  related_user_id?: string
  stream_id?: string
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

  platform_fee_percentage: number
  platform_fee_coins: number
  net_pi_amount: number

  status: WithdrawalStatus

  requested_at: string
  processed_at?: string
  admin_notes?: string
}

// ============================
// CONFIG TYPES
// ============================

export interface AppConfig {
  platform_fee_percentage: number
  pi_to_coin_rate: number
}

export interface LoginBonus {
  order_min: number
  order_max: number
  coin_bonus: number
  entry_cost_pi: number
}
