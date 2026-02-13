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
  GET_USER_COINS: (id: string) => `/api/users/${id}/coins`,

  // ============================
  // STREAMS
  // ============================
  GET_STREAMS: `/api/streams`,
  GET_STREAM: (id: string) => `/api/streams/${id}`,

  CREATE_STREAM: `/api/streams/create`,

  START_STREAM: (id: string) => `/api/streams/${id}/start`,
  END_STREAM: (id: string) => `/api/streams/${id}/end`,

  LIVE_STREAMS: `/api/streams/live`,

  // ============================
  // GIFTS
  // ============================
  GET_GIFTS: `/api/gifts`,
  SEND_GIFT: `/api/gifts/send`,

  // ============================
  // LIVEKIT TOKEN
  // ============================
  LIVEKIT_TOKEN: `/api/livekit/token`,

  // ============================
  // WITHDRAWALS
  // ============================
  GET_WITHDRAWALS: (hostId: string) =>
    `/api/withdrawals/host/${hostId}`,

  REQUEST_WITHDRAWAL: `/api/withdrawals/request`,

  GET_ALL_WITHDRAWALS: `/api/admin/withdrawals`,
  PROCESS_WITHDRAWAL: (id: string) =>
    `/api/admin/withdrawals/${id}/process`,

  // ============================
  // CONFIG
  // ============================
  GET_CONFIG: `/api/config`,
  UPDATE_CONFIG: `/api/admin/config`,
} as const