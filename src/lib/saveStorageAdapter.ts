export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface KeyEnumerableStorageLike extends StorageLike {
  key(index: number): string | null;
  readonly length: number;
}

export interface SaveStorageAdapter {
  readonly backend: "localStorage" | "capacitor-preferences-sqlite";
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  listKeys(prefix?: string): string[];
}

function supportsKeyEnumeration(storage: StorageLike): storage is KeyEnumerableStorageLike {
  return typeof (storage as Partial<KeyEnumerableStorageLike>).key === "function" && typeof (storage as Partial<KeyEnumerableStorageLike>).length === "number";
}

function enumerateKeys(storage: StorageLike, prefix?: string): string[] {
  if (!supportsKeyEnumeration(storage)) {
    return [];
  }

  const out: string[] = [];
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (!key) continue;
    if (prefix && !key.startsWith(prefix)) continue;
    out.push(key);
  }
  return out;
}

function createAdapter(backend: SaveStorageAdapter["backend"], storage: StorageLike): SaveStorageAdapter {
  return {
    backend,
    getItem: (key) => storage.getItem(key),
    setItem: (key, value) => storage.setItem(key, value),
    removeItem: (key) => storage.removeItem(key),
    listKeys: (prefix) => enumerateKeys(storage, prefix),
  };
}

export function createLocalStorageAdapter(storage: StorageLike): SaveStorageAdapter {
  return createAdapter("localStorage", storage);
}

export function createCapacitorPreferencesSqliteAdapter(storage: StorageLike): SaveStorageAdapter {
  return createAdapter("capacitor-preferences-sqlite", storage);
}

export function isCapacitorIosEnvironment(): boolean {
  const cap = (globalThis as {
    Capacitor?: {
      isNativePlatform?: () => boolean;
      getPlatform?: () => string;
    };
  }).Capacitor;

  if (!cap) return false;
  if (typeof cap.isNativePlatform === "function" && !cap.isNativePlatform()) return false;
  return typeof cap.getPlatform === "function" && cap.getPlatform() === "ios";
}
