"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, setApiAuthToken } from "@/lib/api";
import { BACKEND_URLS, PI_NETWORK_CONFIG } from "@/lib/system-config";

/* ================== TYPES ================== */
export type LoginDTO = {
  id: string;
  username: string;
  credits_balance: number;
  terms_accepted: boolean;
};

interface PiAuthResult {
  accessToken: string;
  user: {
    uid: string;
    username: string;
  };
}

declare global {
  interface Window {
    Pi?: {
      init: (config: { version: string; sandbox?: boolean }) => Promise<void>;
      authenticate: (scopes: string[]) => Promise<PiAuthResult>;
    };
  }
}

interface PiAuthContextType {
  isAuthenticated: boolean;
  authMessage: string;
  userData: LoginDTO | null;
  reinitialize: () => Promise<void>;
}

/* ================== CONTEXT ================== */
const PiAuthContext = createContext<PiAuthContextType | null>(null);

/* ================== DEV USER ================== */
const DEV_USER: LoginDTO = {
  id: "dev-001",
  username: "Developer",
  credits_balance: 999999,
  terms_accepted: true,
};

/* ================== LOAD SDK ================== */
function loadPiSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Pi) return resolve();

    const script = document.createElement("script");
    script.src = PI_NETWORK_CONFIG.SDK_URL!;
    script.async = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Pi SDK"));

    document.head.appendChild(script);
  });
}

/* ================== PROVIDER ================== */
export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMessage, setAuthMessage] = useState("Initializing...");
  const [userData, setUserData] = useState<LoginDTO | null>(null);

  const loginWithPi = async () => {
    setAuthMessage("Authenticating with Pi...");

    const auth = await window.Pi!.authenticate(["username"]);

    setAuthMessage("Logging in...");
    const res = await api.post<LoginDTO>(BACKEND_URLS.LOGIN, {
      pi_auth_token: auth.accessToken,
    });

    setApiAuthToken(auth.accessToken);
    setUserData(res.data);
    setIsAuthenticated(true);
  };

  const initialize = async () => {
    try {
      await loadPiSDK();

      if (window.Pi) {
        // Pi Browser / Sandbox
        await window.Pi.init({
          version: "2.0",
          sandbox: PI_NETWORK_CONFIG.SANDBOX,
        });

        // WAJIB JEDA
        await new Promise((r) => setTimeout(r, 800));

        await loginWithPi();
      } else {
        // Browser biasa
        setAuthMessage("Dev Login");
        setUserData(DEV_USER);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("Pi Auth Error:", err);
      setAuthMessage("Authentication failed");
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  return (
    <PiAuthContext.Provider
      value={{
        isAuthenticated,
        authMessage,
        userData,
        reinitialize: initialize,
      }}
    >
      {children}
    </PiAuthContext.Provider>
  );
}

/* ================== HOOK ================== */
export function usePiAuth() {
  const ctx = useContext(PiAuthContext);
  if (!ctx) {
    throw new Error("usePiAuth must be used inside PiAuthProvider");
  }
  return ctx;
}
