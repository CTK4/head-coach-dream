import { clearAuthTokens, persistAuthTokens, readAuthTokens } from './tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8787';

export async function login(email: string, password: string, device: { deviceId: string; platform: string; appVersion?: string }) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, device }),
  });

  if (!response.ok) throw new Error('Login failed');
  const tokenSet = await response.json();
  await persistAuthTokens({ accessToken: tokenSet.accessToken, refreshToken: tokenSet.refreshToken });
  return tokenSet;
}

export async function refresh() {
  const tokens = await readAuthTokens();
  if (!tokens) throw new Error('No refresh token available');

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
  });

  if (!response.ok) {
    await clearAuthTokens();
    throw new Error('Refresh failed');
  }

  const tokenSet = await response.json();
  await persistAuthTokens({ accessToken: tokenSet.accessToken, refreshToken: tokenSet.refreshToken });
  return tokenSet;
}

export async function me() {
  const tokens = await readAuthTokens();
  if (!tokens) throw new Error('Missing access token');

  const response = await fetch(`${API_BASE_URL}/me`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
  });

  if (response.status === 401) {
    await refresh();
    const updated = await readAuthTokens();
    if (!updated) throw new Error('Missing tokens after refresh');
    return fetch(`${API_BASE_URL}/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${updated.accessToken}` },
    }).then((res) => res.json());
  }

  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
}

export async function logout() {
  const tokens = await readAuthTokens();
  if (tokens) {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.accessToken}`,
      },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });
  }

  await clearAuthTokens();
}
