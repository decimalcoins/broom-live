import { BACKEND_CONFIG } from "./system-config";

type FetchResponse<T> = {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
};

export interface ApiError<T = unknown> extends Error {
  status: number;
  data: T;
}

let authToken: string | null = null;

const defaultHeaders: Record<string, string> = {
  "Content-Type": "application/json",
};

//  RESOLVE BASE URL 
const resolveBaseURL = () => {
  if (BACKEND_CONFIG.BASE_URL && BACKEND_CONFIG.BASE_URL.length > 0) {
    return BACKEND_CONFIG.BASE_URL;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:3000";
};

const BASE_URL = resolveBaseURL();

const request = async <T = any>(
  url: string,
  init: RequestInit = {}
): Promise<FetchResponse<T>> => {
  const headers: Record<string, string> = {
    ...defaultHeaders,
    ...(init.headers as Record<string, string> | undefined),
  };

  if (authToken) headers["Authorization"] = authToken;

  //  BASE_URL
  const fullUrl = url.startsWith("http")
    ? url
    : `${BASE_URL}${url}`;

  const response = await fetch(fullUrl, { ...init, headers });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  const data =
    response.status === 204
      ? null
      : isJson
      ? await response.json()
      : await response.text();

  if (!response.ok) {
    const error = new Error(
      response.statusText || "Request failed"
    ) as ApiError<T>;
    error.status = response.status;
    error.data = data as T;
    throw error;
  }

  return {
    data: data as T,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  };
};

export const api = {
  get: <T = any>(url: string, init?: RequestInit) =>
    request<T>(url, { ...init, method: "GET" }),

  delete: <T = any>(url: string, init?: RequestInit) =>
    request<T>(url, { ...init, method: "DELETE" }),

  post: <T = any>(url: string, body?: any, init?: RequestInit) =>
    request<T>(url, {
      ...init,
      method: "POST",
      body: body === undefined ? init?.body : JSON.stringify(body),
    }),

  put: <T = any>(url: string, body?: any, init?: RequestInit) =>
    request<T>(url, {
      ...init,
      method: "PUT",
      body: body === undefined ? init?.body : JSON.stringify(body),
    }),

  patch: <T = any>(url: string, body?: any, init?: RequestInit) =>
    request<T>(url, {
      ...init,
      method: "PATCH",
      body: body === undefined ? init?.body : JSON.stringify(body),
    }),
};

export const setApiAuthToken = (token: string) => {
  authToken = token;
};
