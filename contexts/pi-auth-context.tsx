"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { PI_NETWORK_CONFIG } from "@/lib/system-config";
import { api, setApiAuthToken } from "@/lib/api";

export type LoginDTO = {
  id: string;
  username: string;
  credits_balance: number;
  terms_accepted: boolean;
};

declare global {
  interface Window {
    Pi?: {
      init: (config: { version: string; sandbox?: boolean }) => Promise<void>;
      authenticate: (scopes: string[]) => Promise<{
        accessToken: string;
        user: { uid: string; username: string };
      }>;
    };
  }
}

interface PiAuthContextType {
  isAuthenticated: boolean;
  authMessage: string;
  userData: LoginDTO | null;
  reinitialize: () => Promise<void>;
}

const PiAuthContext = createContext<PiAuthContextType | null>(null);

/* =========================
   DEV FALLBACK (NON PI)
========================= */
const DEV_USER: LoginDTO = {
  id: "dev-user",
  username: "Developer",
  credits_balance: 999999,
  terms_accepted: true,
};

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMessage, setAuthMessage] = useState("Initializing...");
  const [userData, setUserData] = useState<LoginDTO | null>(null);

  const initPi = async () => {
    try {
      setAuthMessage("Loading Pi SDK...");

      if (!window.Pi) {
        throw new Error("Pi SDK not available");
      }

      await window.Pi.init({
        version: "2.0",
        sandbox: true, // ✅ WAJIB TRUE untuk sandbox.minepi.com
      });

      setAuthMessage("Authenticating with Pi...");
      const auth = await window.Pi.authenticate(["username"]);

      // ⚠️ Backend login OPTIONAL dulu
      setApiAuthToken(auth.accessToken);

      setUserData({
        id: auth.user.uid,
        username: auth.user.username,
        credits_balance: 0,
        terms_accepted: true,
      });

      setIsAuthenticated(true);
    } catch (err) {
      console.error("❌ Pi Auth failed:", err);
      setAuthMessage("Pi Auth failed, fallback to dev");
      setUserData(DEV_USER);
      setIsAuthenticated(true);
    }
  };

  useEffect(() => {
    const isPiBrowser =
      typeof window !== "undefined" && typeof window.Pi !== "undefined";

    if (isPiBrowser) {
      console.log("🟣 Pi Browser detected");
      initPi();
    } else {
      console.log("🖥 Normal browser → Dev mode");
      setUserData(DEV_USER);
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <PiAuthContext.Provider
      value={{
        isAuthenticated,
        authMessage,
        userData,
        reinitialize: initPi,
      }}
    >
      {children}
    </PiAuthContext.Provider>
  );
}

export function usePiAuth() {
  const ctx = useContext(PiAuthContext);
  if (!ctx) throw new Error("usePiAuth must be inside PiAuthProvider");
  return ctx;
}
