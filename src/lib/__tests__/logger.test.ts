import { beforeEach, describe, expect, it } from 'vitest';
import { clearLogsForTests, getRecentLogs, logInfo } from '@/lib/logger';

function installStorageMock() {
  const store = new Map<string, string>();
  (globalThis as any).window = {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    },
  };
}

describe('logger', () => {
  beforeEach(() => {
    installStorageMock();
    clearLogsForTests();
  });

  it('keeps only the most recent entries in ring buffer', () => {
    for (let i = 0; i < 550; i += 1) logInfo('event', { meta: { i } });
    const recent = getRecentLogs(600);
    expect(recent).toHaveLength(500);
    expect(recent[0].meta?.i).toBe(50);
    expect(recent[499].meta?.i).toBe(549);
  });

  it('hydrates persisted logs across reloads', () => {
    logInfo('persist-check', { meta: { ok: true } });
    const raw = (globalThis as any).window.localStorage.getItem('hc_debug_log');
    expect(raw).toBeTruthy();

    clearLogsForTests();
    (globalThis as any).window.localStorage.setItem('hc_debug_log', raw);
    const rehydrated = getRecentLogs(5);
    expect(rehydrated[0].event).toBe('persist-check');
  });
});
