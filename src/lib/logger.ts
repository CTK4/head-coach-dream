export type LogLevel = "info" | "warn" | "error";

export type LogContext = {
  phase?: string;
  saveId?: string | null;
  season?: number;
  week?: number;
  driveIndex?: number;
  playIndex?: number;
  meta?: Record<string, unknown>;
};

export type LogEvent = {
  ts: string;
  level: LogLevel;
  event: string;
  phase?: string;
  saveId?: string | null;
  season?: number;
  week?: number;
  driveIndex?: number;
  playIndex?: number;
  meta?: Record<string, unknown>;
};

const STORAGE_KEY = "hc_debug_log";
const MAX_IN_MEMORY = 500;
const MAX_PERSISTED = 200;

let inMemoryBuffer: LogEvent[] = [];

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function sanitizeMeta(meta: Record<string, unknown> | undefined) {
  if (!meta) return undefined;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (value === undefined) continue;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null) {
      out[key] = value;
      continue;
    }
    if (Array.isArray(value)) {
      out[key] = value.slice(0, 20).map((item) => (item === null ? null : typeof item === "object" ? "[redacted-object]" : item));
      continue;
    }
    out[key] = "[redacted-object]";
  }
  return out;
}

function persistRecentLogs() {
  if (!canUseStorage()) return;
  try {
    const persisted = inMemoryBuffer.slice(-MAX_PERSISTED);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  } catch {
    // ignore storage quota / environment errors
  }
}

function hydrate() {
  if (!canUseStorage() || inMemoryBuffer.length > 0) return;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as LogEvent[];
    if (Array.isArray(parsed)) inMemoryBuffer = parsed.slice(-MAX_IN_MEMORY);
  } catch {
    inMemoryBuffer = [];
  }
}

export function pushLog(level: LogLevel, event: string, ctx?: LogContext): LogEvent {
  hydrate();
  const record: LogEvent = {
    ts: new Date().toISOString(),
    level,
    event,
    phase: ctx?.phase,
    saveId: ctx?.saveId ?? undefined,
    season: Number.isFinite(ctx?.season) ? Number(ctx?.season) : undefined,
    week: Number.isFinite(ctx?.week) ? Number(ctx?.week) : undefined,
    driveIndex: Number.isFinite(ctx?.driveIndex) ? Number(ctx?.driveIndex) : undefined,
    playIndex: Number.isFinite(ctx?.playIndex) ? Number(ctx?.playIndex) : undefined,
    meta: sanitizeMeta(ctx?.meta),
  };

  inMemoryBuffer.push(record);
  if (inMemoryBuffer.length > MAX_IN_MEMORY) inMemoryBuffer = inMemoryBuffer.slice(-MAX_IN_MEMORY);

  persistRecentLogs();
  return record;
}

export function logInfo(event: string, ctx?: LogContext) {
  return pushLog("info", event, ctx);
}

export function logWarn(event: string, ctx?: LogContext) {
  return pushLog("warn", event, ctx);
}

export function logError(event: string, ctx?: LogContext) {
  return pushLog("error", event, ctx);
}

export function getRecentLogs(limit = MAX_IN_MEMORY): LogEvent[] {
  hydrate();
  const max = Math.max(1, Math.floor(limit));
  return inMemoryBuffer.slice(-max);
}

export function clearLogsForTests() {
  inMemoryBuffer = [];
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}
