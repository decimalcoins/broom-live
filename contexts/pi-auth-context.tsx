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
    Pi: {
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

//
// ✅ DEV Dummy User (Chrome Testing Only)
//
const DEV_DUMMY_USER: LoginDTO = {
  id: "dev-user-001",
  username: "Developer",
  credits_balance: 999999,
  terms_accepted: true,
};

//
// Load Pi SDK Script
//
const loadPiSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");

    if (!PI_NETWORK_CONFIG.SDK_URL) {
      throw new Error("SDK URL is not set");
    }

    script.src = PI_NETWORK_CONFIG.SDK_URL;
    script.async = true;

    script.onload = () => {
      console.log("✅ Pi SDK script loaded successfully");
      resolve();
    };

    script.onerror = () => {
      console.error("❌ Failed to load Pi SDK script");
      reject(new Error("Failed to load Pi SDK script"));
    };

    document.head.appendChild(script);
  });
};

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMessage, setAuthMessage] = useState("Initializing Pi Network...");
  const [piAccessToken, setPiAccessToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<LoginDTO | null>(null);

  //
  // Authenticate + Backend Login
  //
  const authenticateAndLogin = async (): Promise<void> => {
    setAuthMessage("Authenticating with Pi Network...");

    const piAuthResult = await window.Pi.authenticate(["username"]);

    setAuthMessage("Logging in to backend...");

    const loginRes = await api.post<LoginDTO>(BACKEND_URLS.LOGIN, {
      pi_auth_token: piAuthResult.accessToken,
    });

    if (piAuthResult?.accessToken) {
      setPiAccessToken(piAuthResult.accessToken);
      setApiAuthToken(piAuthResult.accessToken);
    }

    setUserData(loginRes.data);
  };

  //
  // Initialize Pi + DEV Bypass Support
  //
  const initializePiAndAuthenticate = async () => {
    try {
      // ============================
      // ✅ DEV MODE BYPASS (SAFE)
      // ============================
      if (process.env.NEXT_PUBLIC_APP_MODE === "dev") {
        if (typeof window !== "undefined" && !(window as any).Pi) {
          console.warn("⚡ DEV MODE ACTIVE → Using Dummy Login");

          setAuthMessage("DEV MODE: Auto Login Enabled");

          // Dummy token
          setPiAccessToken("dev-token");
          setApiAuthToken("dev-token");

          // Dummy user
          setUserData(DEV_DUMMY_USER);

          // Mark authenticated
          setIsAuthenticated(true);

          return;
        }
      }

      // ============================
      // ✅ NORMAL PROD FLOW
      // ============================

      setAuthMessage("Loading Pi Network SDK...");

      // Load SDK if not already loaded
      if (typeof window.Pi === "undefined") {
        await loadPiSDK();
      }

      if (typeof window.Pi === "undefined") {
        throw new Error("Pi object not available after script load");
      }

      setAuthMessage("Initializing Pi Network...");

      await window.Pi.init({
        version: "2.0",
        sandbox: PI_NETWORK_CONFIG.SANDBOX,
      });

      await authenticateAndLogin();

      setIsAuthenticated(true);
    } catch (err) {
      console.error("❌ Pi Network initialization failed:", err);

      setAuthMessage(
        "Failed to authenticate or login. Please refresh and try again."
      );
    }
  };

  useEffect(() => {
    initializePiAndAuthenticate();
  }, []);

  const value: PiAuthContextType = {
    isAuthenticated,
    authMessage,
    piAccessToken,
    userData,
    reinitialize: initializePiAndAuthenticate,
  };

  return (
    <PiAuthContext.Provider value={value}>
      {children}
    </PiAuthContext.Provider>
  );
}

//
// Hook
//
export function usePiAuth() {
  const context = useContext(PiAuthContext);

  if (context === undefined) {
    throw new Error("usePiAuth must be used within a PiAuthProvider");
  }

  return context;
}