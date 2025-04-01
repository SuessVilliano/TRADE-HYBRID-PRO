/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly MODE: string;
    readonly BASE_URL: string;
    readonly VITE_NODE_ENV?: string;
    readonly VITE_WHOP_API_KEY?: string;
    readonly VITE_WHOP_CLIENT_ID?: string;
    readonly VITE_WHOP_CLIENT_SECRET?: string;
    readonly VITE_BINANCE_US_API_KEY?: string;
    readonly VITE_BINANCE_US_SECRET_KEY?: string;
  };
}