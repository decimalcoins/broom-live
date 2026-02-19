// ============================
// Internal Next.js API Routes
// Semua request langsung ke:
// app/api/*
// ============================

export const API_ROUTES = {
  // ============================
  // USERS
  // ============================

  GET_USER: (id: string) => `/api/users/${id}`,

  GET_USER_COINS: (id: string) => `/api/user/${id}/coin`,

  GET_ME: `/api/user/me`,

  // ============================
  // TRANSACTIONS
  // ============================

  GET_TRANSACTIONS: (id: string) => `/api/transactions/${id}`,

  // ============================
  // WITHDRAWALS
  // ============================

  REQUEST_WITHDRAWAL: `/api/withdrawals/request`,

  GET_WITHDRAWALS: (hostId: string) =>
    `/api/withdrawals/host/${hostId}`,

  // ============================
  // STREAMS
  // ============================

  GET_LIVE_STREAMS: `/api/streams/live`,

  CREATE_STREAM: `/api/streams/create`,

  // ✅ STREAM DETAIL (app/api/streams/[id]/route.ts)
  GET_STREAM: (id: string) => `/api/streams/${id}`,

  // ✅ HOST TOKEN (app/api/streams/[id]/host-token/route.ts)
  HOST_TOKEN: (id: string) =>
    `/api/streams/${id}/host-token`,

  // ✅ VIEWER TOKEN (app/api/streams/[id]/viewer-token/route.ts)
  VIEWER_TOKEN: (id: string) =>
    `/api/streams/${id}/viewer-token`,

  END_STREAM: `/api/streams/end`,

  START_STREAM: `/api/streams/start`,

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
