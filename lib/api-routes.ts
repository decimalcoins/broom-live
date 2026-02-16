// ============================
// Internal Next.js API Routes
// Semua request langsung ke:
// app/api/*
// ============================

export const API_ROUTES = {
  // ============================
  // USERS
  // ============================

  // ✅ User Profile
  GET_USER: (id: string) => `/api/users/${id}`,

  // ✅ Coin Balance (sesuai folder kamu)
  // app/api/user/[id]/coin/route.ts
  GET_USER_COINS: (id: string) => `/api/user/${id}/coin`,

  // ✅ Transactions
  GET_TRANSACTIONS: (id: string) =>
    `/api/users/${id}/transactions`,

  // ✅ Current logged user
  GET_ME: `/api/user/me`,

  // ============================
  // STREAMS
  // ============================

  GET_STREAMS: `/api/streams`,

  GET_STREAM: (id: string) => `/api/streams/${id}`,

  CREATE_STREAM: `/api/streams/create`,

  START_STREAM: (id: string) => `/api/streams/${id}/start`,
  END_STREAM: (id: string) => `/api/streams/${id}/end`,

  LIVE_STREAMS: `/api/streams/live`,

  VIEWER_TOKEN: (id: string) =>
    `/api/streams/${id}/viewer-token`,

  // ============================
  // GIFTS
  // ============================

  SEND_GIFT: `/api/gifts/send`,

  // ============================
  // LIVEKIT
  // ============================

  LIVEKIT_TOKEN: `/api/livekit/token`,

  // ============================
  // PAYMENTS
  // ============================

  PAYMENT_APPROVE: `/api/payments/approve`,
  PAYMENT_COMPLETE: `/api/payments/complete`,

  // ============================
  // WITHDRAWALS
  // ============================

  GET_WITHDRAWALS: (hostId: string) =>
    `/api/withdrawals/host/${hostId}`,

  REQUEST_WITHDRAWAL: `/api/withdrawals/request`,

  // ============================
  // ADMIN
  // ============================

  GET_ALL_WITHDRAWALS: `/api/admin/withdrawals`,

  PROCESS_WITHDRAWAL: (id: string) =>
    `/api/admin/withdrawals/${id}/process`,

  // ============================
  // CONFIG
  // ============================

  GET_CONFIG: `/api/config`,
  UPDATE_CONFIG: `/api/admin/config`,
} as const
