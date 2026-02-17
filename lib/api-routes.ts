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

  // ✅ Coin Balance
  // app/api/user/[id]/coin/route.ts
  GET_USER_COINS: (id: string) => `/api/user/${id}/coin`,

  // ✅ Logged user info
  GET_ME: `/api/user/me`,

  // ============================
  // TRANSACTIONS
  // ============================

  // app/api/transactions/[id]/route.ts
  GET_TRANSACTIONS: (id: string) => `/api/transactions/${id}`,

  // ============================
  // WITHDRAWALS
  // ============================

  // app/api/withdrawals/request/route.ts
  REQUEST_WITHDRAWAL: `/api/withdrawals/request`,

  // app/api/withdrawals/host/[id]/route.ts (kalau ada)
  GET_WITHDRAWALS: (hostId: string) =>
    `/api/withdrawals/host/${hostId}`,

  // ============================
  // STREAMS
  // ============================

  // app/api/streams/live/route.ts
  GET_LIVE_STREAMS: `/api/streams/live`,

  // app/api/streams/create/route.ts
  CREATE_STREAM: `/api/streams/create`,

  // app/api/streams/[id]/route.ts
  GET_STREAM: (id: string) => `/api/streams/${id}`,

  // app/api/streams/end/route.ts
  END_STREAM: `/api/streams/end`,

  // app/api/streams/start/route.ts (kalau ada)
  START_STREAM: `/api/streams/start`,

  // app/api/streams/[id]/viewer-token/route.ts
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
