/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_API_SAVE_MODE?: "true" | "false";
  readonly VITE_SAVE_API_BASE_URL?: string;
}
