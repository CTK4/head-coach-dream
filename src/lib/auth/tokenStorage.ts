import { Capacitor } from '@capacitor/core';

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

function secureStoragePlugin(): SecureStoragePlugin | null {
  const plugins = (Capacitor as unknown as { Plugins?: Record<string, unknown> }).Plugins;
  const plugin = plugins?.SecureStoragePlugin as SecureStoragePlugin | undefined;
  return plugin ?? null;
}

function isIosNative() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
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
