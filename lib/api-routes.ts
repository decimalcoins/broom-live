export const API_ROUTES = {
  // Streams
  GET_STREAMS: `/api/streams`,
  GET_STREAM: (id: string) => `/api/streams/${id}`,
  CREATE_STREAM: `/api/streams/create`,
  START_STREAM: (id: string) => `/api/streams/${id}/start`,
  END_STREAM: (id: string) => `/api/streams/${id}/end`,

  // WebSockets (ADD THIS)
  CHAT_WS: (id: string) => {
    const proto =
      typeof window !== "undefined" && window.location.protocol === "https:"
        ? "wss"
        : "ws";
    return `${proto}://${window.location.host}/api/streams/${id}/ws`;
  },

  // Tokens
  HOST_TOKEN: (id: string) => `/api/streams/${id}/host-token`,
  VIEWER_TOKEN: (id: string) => `/api/streams/${id}/viewer-token`,

  // Wallet & Coins
  GET_USER_COINS: (id: string) => `/api/wallet/${id}`,
  PURCHASE_COINS: `/api/wallet/purchase`,
  GET_TRANSACTIONS: (id: string) => `/api/transactions/${id}`,

  // Gifts
  GET_GIFTS: `/api/gifts`,
  SEND_GIFT: `/api/gifts/send`,

  // Withdrawal
  REQUEST_WITHDRAWAL: `/api/withdrawals/request`,
  GET_WITHDRAWALS: (id: string) => `/api/withdrawals/host/${id}`,
  GET_ALL_WITHDRAWALS: `/api/withdrawals/admin`,
  PROCESS_WITHDRAWAL: (id: string) => `/api/withdrawals/${id}/process`,

  // Config
  GET_CONFIG: `/api/config`,
  UPDATE_CONFIG: `/api/config/update`,
} as const;
