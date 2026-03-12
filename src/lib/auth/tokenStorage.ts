const ACCESS_KEY = 'hc.auth.accessToken';
const REFRESH_KEY = 'hc.auth.refreshToken';

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

type SecureStoragePlugin = {
  set: (options: { key: string; value: string }) => Promise<void>;
  get: (options: { key: string }) => Promise<{ value: string | null }>;
  remove: (options: { key: string }) => Promise<void>;
};

type CapacitorGlobal = {
  isNativePlatform: () => boolean;
  getPlatform: () => string;
  Plugins?: Record<string, unknown>;
};

function getCapacitor(): CapacitorGlobal | null {
  const candidate = (globalThis as { Capacitor?: unknown }).Capacitor;
  if (!candidate || typeof candidate !== 'object') return null;

  const typed = candidate as Partial<CapacitorGlobal>;
  if (typeof typed.isNativePlatform !== 'function' || typeof typed.getPlatform !== 'function') return null;
  return typed as CapacitorGlobal;
}

function secureStoragePlugin(): SecureStoragePlugin | null {
  const capacitor = getCapacitor();
  const plugin = capacitor?.Plugins?.SecureStoragePlugin as SecureStoragePlugin | undefined;
  return plugin ?? null;
}

function isIosNative() {
  const capacitor = getCapacitor();
  return Boolean(capacitor?.isNativePlatform() && capacitor.getPlatform() === 'ios');
}

export async function persistAuthTokens(tokens: TokenPair) {
  if (isIosNative()) {
    const secureStore = secureStoragePlugin();
    if (!secureStore) {
      throw new Error('SecureStoragePlugin is required on iOS to persist auth tokens in Keychain.');
    }

    await secureStore.set({ key: ACCESS_KEY, value: tokens.accessToken });
    await secureStore.set({ key: REFRESH_KEY, value: tokens.refreshToken });
    return;
  }

  window.localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  window.localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
}

export async function readAuthTokens(): Promise<TokenPair | null> {
  if (isIosNative()) {
    const secureStore = secureStoragePlugin();
    if (!secureStore) {
      throw new Error('SecureStoragePlugin is required on iOS to read auth tokens from Keychain.');
    }

    const access = await secureStore.get({ key: ACCESS_KEY });
    const refresh = await secureStore.get({ key: REFRESH_KEY });
    if (!access.value || !refresh.value) return null;
    return { accessToken: access.value, refreshToken: refresh.value };
  }

  const accessToken = window.localStorage.getItem(ACCESS_KEY);
  const refreshToken = window.localStorage.getItem(REFRESH_KEY);
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

export async function clearAuthTokens() {
  if (isIosNative()) {
    const secureStore = secureStoragePlugin();
    if (!secureStore) {
      throw new Error('SecureStoragePlugin is required on iOS to clear auth tokens from Keychain.');
    }

    await secureStore.remove({ key: ACCESS_KEY });
    await secureStore.remove({ key: REFRESH_KEY });
    return;
  }

  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
}
