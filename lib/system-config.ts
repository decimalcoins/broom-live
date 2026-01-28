// LOCKED FILE

          // *** System Configuration - NON-EDITABLE VALUES ***
          // This file contains configuration values that should not be modified during normal app customization.
          // These values are set during app creation.

          // Pi Network Configuration
          export const PI_NETWORK_CONFIG = {
            SDK_URL: "https://sdk.minepi.com/pi-sdk.js",
            SANDBOX: false,
          } as const;

          // Backend Configuration
          export const BACKEND_CONFIG = {
            BASE_URL: process.env.NEXT_PUBLIC_APP_URL ||"", 
          } as const;

          // Backend URLs
          export const BACKEND_URLS = {
            LOGIN: "/api/auth/login",

          } as const;
