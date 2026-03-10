export type DevToolsEnv = Pick<ImportMetaEnv, "DEV" | "VITE_ENABLE_QA_TOOLS">;

export function isDevToolsEnabled(env: DevToolsEnv): boolean {
  return env.DEV || env.VITE_ENABLE_QA_TOOLS === "true";
}

const devToolsEnv: DevToolsEnv = {
  DEV: import.meta.env.DEV,
  VITE_ENABLE_QA_TOOLS: import.meta.env.VITE_ENABLE_QA_TOOLS,
};

export const DEV_TOOLS_ENABLED = isDevToolsEnabled(devToolsEnv);
