// ============================
// USER TYPES
// ============================
export type UserRole = "VIEWER" | "HOST" | "ADMIN"

export interface User {
  id: string
  uid: string              // ✅ Pi UID (PRIMARY IDENTITY)
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

  // DB relations
  host_id: string          // users.id
  host_uid: string         // ✅ IMPORTANT (for LiveKit room)
  host_username: string

  // Stream info
  title: string
  description: string | null
  thumbnail_url?: string

  // Status
  is_live: boolean
  viewer_count: number

  // Time
  started_at: string | null
  ended_at: string | null
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

export type TransactionCurrency = "coins" | "pi"

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  currency: TransactionCurrency

  related_user_id?: string
  stream_id?: string

  created_at: string
}

// ============================
// CHAT TYPES
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
// GIFT EVENT (REALTIME LIVEKIT)
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
// APP CONFIG TYPES
// ============================
export interface AppConfig {
  platform_fee_percentage: number
  pi_to_coin_rate: number     // 1 Pi = 314159 Coins
  coin_to_gift_rate: number   // Gift scaling
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
