"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { PI_NETWORK_CONFIG, BACKEND_URLS } from "@/lib/system-config";
import { api, setApiAuthToken } from "@/lib/api";

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
  piAccessToken: string | null;
  userData: LoginDTO | null;
  reinitialize: () => Promise<void>;
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined);

// ===== DEV FALLBACK USER (untuk Chrome/Edge) =====
const DevFallbackUser: LoginDTO = {
  id: "dev-001",
  username: "Developer",
  credits_balance: 500000,
  terms_accepted: true,
};

const loadPiSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");

    if (!PI_NETWORK_CONFIG.SDK_URL) {
      throw new Error("SDK URL is not set");
    }

    script.src = PI_NETWORK_CONFIG.SDK_URL;
    script.async = true;

    script.onload = () => {
      console.log("✅ Pi SDK loaded");
      resolve();
    };

    script.onerror = () => {
      console.error("❌ Failed to load Pi SDK");
      reject(new Error("Failed to load Pi SDK"));
    };

    document.head.appendChild(script);
  });
};

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMessage, setAuthMessage] = useState("Initializing...");
  const [piAccessToken, setPiAccessToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<LoginDTO | null>(null);

  const authenticateAndLogin = async () => {
    setAuthMessage("Authenticating Pi...");
    const piAuthResult = await window.Pi!.authenticate(["username"]);

    setAuthMessage("Logging in backend...");
    const loginRes = await api.post<LoginDTO>(BACKEND_URLS.LOGIN, {
      pi_auth_token: piAuthResult.accessToken,
    });

    setPiAccessToken(piAuthResult.accessToken);
    setApiAuthToken(piAuthResult.accessToken);
    setUserData(loginRes.data);
  };

  const initializePiAndAuthenticate = async () => {
    try {
      setAuthMessage("Loading Pi SDK...");
      await loadPiSDK();

      if (!window.Pi) throw new Error("Pi not available after load");

      setAuthMessage("Initializing Pi Browser...");
      await window.Pi.init({
        version: "2.0",
        sandbox: PI_NETWORK_CONFIG.SANDBOX,
      });

      await authenticateAndLogin();
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Pi Auth Error:", err);
      setAuthMessage("Pi Authentication failed");
    }
  };

  useEffect(() => {
    const isPiBrowser = typeof window !== "undefined" && window.Pi;

    if (isPiBrowser) {
      console.log("🌐 Detected Pi Browser → Real Auth Mode");
      initializePiAndAuthenticate();
      return;
    }

    console.log("🖥 Detected Normal Browser → Dev Fallback Mode");
    setAuthMessage("Dev Login...");
    setUserData(DevFallbackUser);
    setIsAuthenticated(true);
  }, []);

  const value: PiAuthContextType = {
    isAuthenticated,
    authMessage,
    piAccessToken,
    userData,
    reinitialize: initializePiAndAuthenticate,
  };

  return (
    <PiAuthContext.Provider value={value}>{children}</PiAuthContext.Provider>
  );
}

export function usePiAuth() {
  const context = useContext(PiAuthContext);
  if (context === undefined) {
    throw new Error("usePiAuth must be used within a PiAuthProvider");
  }
  return context;
}
