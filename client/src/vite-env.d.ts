/// <reference types="vite/client" />

/**
 * TypeScript definitions for Vite environment variables
 */
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  // Add other env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
