import type { LoginBonus, AppConfig } from "./types"

// Login bonus tiers based on order
export const LOGIN_BONUSES: LoginBonus[] = [
  {
    order_min: 1,
    order_max: 20,
    coin_bonus: 5000,
    entry_cost_pi: 0,
  },
  {
    order_min: 21,
    order_max: 100,
    coin_bonus: 500,
    entry_cost_pi: 0,
  },
  {
    order_min: 101,
    order_max: 999999,
    coin_bonus: 50000,
    entry_cost_pi: 1,
  },
]

// Default app config
export const DEFAULT_CONFIG: AppConfig = {
  platform_fee_percentage: 10,
  pi_to_coin_rate: 314159, // 1 Pi = 314,159 Coins
  coin_to_gift_rate: 100, // 100 Gift value unit = 1 Coins 
}

// Calculate coins from Pi
export function piToCoins(pi: number): number {
  return Math.floor(pi * DEFAULT_CONFIG.pi_to_coin_rate)
}

// Calculate Pi from coins
export function coinsToPi(coins: number): number {
  return coins / DEFAULT_CONFIG.pi_to_coin_rate
}

// Get login bonus for order number
export function getLoginBonus(loginOrder: number): LoginBonus {
  return (
    LOGIN_BONUSES.find((bonus) => loginOrder >= bonus.order_min && loginOrder <= bonus.order_max) ||
    LOGIN_BONUSES[LOGIN_BONUSES.length - 1]
  )
}
