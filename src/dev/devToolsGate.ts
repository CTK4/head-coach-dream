export type DevToolsEnv = Pick<ImportMetaEnv, "DEV" | "VITE_ENABLE_QA_TOOLS">;

export function isDevToolsEnabled(env: DevToolsEnv): boolean {
  return env.DEV || env.VITE_ENABLE_QA_TOOLS === "true";
}

export const DEV_TOOLS_ENABLED = isDevToolsEnabled(import.meta.env);
