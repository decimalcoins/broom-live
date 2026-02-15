// ============================
// ✅ USER TYPES (MATCH DATABASE)
// ============================
export type UserRole = "VIEWER" | "HOST" | "ADMIN"

export interface User {
  id: string
  uid: string
  username: string
  role: UserRole

  coin_balance: number
  pi_balance: number

  login_order: number
  created_at: string
}

// ============================
// ✅ STREAM TYPES (ADD host_uid)
// ============================
export interface Stream {
  id: string

  host_id: string
  host_uid: string // ✅ REQUIRED for LiveKit RoomName

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
// GIFTS
// ============================
export interface Gift {
  id: string
  name: string
  coin_cost: number
  image_url: string
  animation_url?: string
}

// ============================
// TRANSACTIONS
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
// CHAT
// ============================
export interface ChatMessage {
  id: string
  stream_id: string

  user_id: string
  username: string

  message: string
  timestamp: string
}

// ============================
// GIFT EVENT
// ============================
export interface GiftEvent {
  id: string
  stream_id: string

  sender_id: string
  sender_username: string

  gift: Gift
  timestamp: string
}

// ============================
// WITHDRAWALS
// ============================
export type WithdrawalStatus = "PENDING" | "APPROVED" | "REJECTED"

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
// APP CONFIG
// ============================
export interface AppConfig {
  platform_fee_percentage: number
  pi_to_coin_rate: number
  coin_to_gift_rate: number
}

// ============================
// LOGIN BONUS CONFIG
// ============================
export interface LoginBonus {
  order_min: number
  order_max: number
  coin_bonus: number
  entry_cost_pi: number
}
