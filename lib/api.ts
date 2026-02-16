type FetchResponse<T> = {
  data: T
  status: number
  statusText: string
  headers: Headers
}

export interface ApiError<T = unknown> extends Error {
  status: number
  data: T
}

let authToken: string | null = null

const request = async <T = any>(
  url: string,
  init: RequestInit = {}
): Promise<FetchResponse<T>> => {
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
  }

  // ✅ Only attach JSON header when body exists
  if (init.body) {
    headers["Content-Type"] = "application/json"
  }

  if (authToken) {
    headers["Authorization"] = authToken
  }

  // ✅ FIX: Always include cookies/session
  const response = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  })

  const contentType = response.headers.get("content-type") || ""
  const isJson = contentType.includes("application/json")

  const data =
    response.status === 204
      ? null
      : isJson
      ? await response.json()
      : await response.text()

  if (!response.ok) {
    const error = new Error(
      (data as any)?.error || response.statusText || "Request failed"
    ) as ApiError<T>

    error.status = response.status
    error.data = data as T
    throw error
  }

  return {
    data: data as T,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  }
}

export const api = {
  get: <T = any>(url: string, init?: RequestInit) =>
    request<T>(url, { ...init, method: "GET" }),

  delete: <T = any>(url: string, init?: RequestInit) =>
    request<T>(url, { ...init, method: "DELETE" }),

  post: <T = any>(url: string, body?: any, init?: RequestInit) =>
    request<T>(url, {
      ...init,
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: <T = any>(url: string, body?: any, init?: RequestInit) =>
    request<T>(url, {
      ...init,
      method: "PUT",
      body: JSON.stringify(body),
    }),

  patch: <T = any>(url: string, body?: any, init?: RequestInit) =>
    request<T>(url, {
      ...init,
      method: "PATCH",
      body: JSON.stringify(body),
    }),
}

export const setApiAuthToken = (token: string) => {
  authToken = token
}
