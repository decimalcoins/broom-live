export const API_ROUTES = {
  // =====================
  // Streams
  // =====================
  GET_STREAMS: `/api/streams`,
  GET_STREAM: (id: string) => `/api/streams/${id}`,
  CREATE_STREAM: `/api/streams/create`,
  START_STREAM: (id: string) => `/api/streams/${id}/start`,
  END_STREAM: (id: string) => `/api/streams/${id}/end`,

  // =====================
  // WebSocket (Live Chat)
  // =====================
  CHAT_WS: (id: string) => {
    if (typeof window === "undefined") return "";
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    return `${proto}://${window.location.host}/api/streams/${id}/ws`;
  },

  // =====================
  // Tokens (LiveKit)
  // =====================
  HOST_TOKEN: (id: string) => `/api/streams/${id}/host-token`,
  VIEWER_TOKEN: (id: string) => `/api/streams/${id}/viewer-token`,

  // =====================
  // Wallet & Coins (✔ FIXED)
  // =====================
  GET_USER_COINS: `/api/wallet/balance`,
  INIT_WALLET: `/api/wallet/init`,
  PURCHASE_COINS: `/api/wallet/purchase`,

  // =====================
  // Gifts
  // =====================
  GET_GIFTS: `/api/gifts`,
  SEND_GIFT: `/api/gifts/send`,

  // =====================
  // Withdrawals
  // =====================
  REQUEST_WITHDRAWAL: `/api/withdrawals/request`,
  GET_WITHDRAWALS: (hostId: string) =>
    `/api/withdrawals/host/${hostId}`,
  GET_ALL_WITHDRAWALS: `/api/withdrawals/admin`,
  PROCESS_WITHDRAWAL: (id: string) =>
    `/api/withdrawals/${id}/process`,

  // =====================
  // Config
  // =====================
  GET_CONFIG: `/api/config`,
  UPDATE_CONFIG: `/api/config/update`,
} as const;
