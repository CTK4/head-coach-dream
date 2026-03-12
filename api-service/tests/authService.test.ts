import { describe, expect, it } from 'vitest';
import { AuthService } from '../src/authService';

const service = () =>
  new AuthService([
    {
      id: 'u1',
      email: 'coach@example.com',
      password: 'password123',
      displayName: 'Coach Prime',
    },
  ]);

describe('AuthService', () => {
  it('issues short-lived access + refresh token pair on login', () => {
    const auth = service();
    const tokenSet = auth.login('coach@example.com', 'password123', {
      deviceId: 'iphone-1',
      platform: 'ios',
    });

    expect(tokenSet).toBeTruthy();
    expect(tokenSet?.accessToken).toContain('.');
    expect(tokenSet?.refreshToken.startsWith('rfr_')).toBe(true);
    expect(tokenSet?.expiresInMs).toBe(15 * 60 * 1000);
  });

  it('rotates refresh tokens and rejects reused token', () => {
    const auth = service();
    const first = auth.login('coach@example.com', 'password123', {
      deviceId: 'iphone-1',
      platform: 'ios',
    });
    if (!first) throw new Error('expected login');

    const rotated = auth.refresh(first.refreshToken);
    expect(rotated.ok).toBe(true);
    if (!rotated.ok) throw new Error('expected rotated token');

    const reused = auth.refresh(first.refreshToken);
    expect(reused).toEqual({ ok: false, code: 'invalid_refresh' });

    const afterReuse = auth.getMe(rotated.accessToken);
    expect(afterReuse).toBeTruthy();
  });

  it('revokes session on logout and invalidates /me', () => {
    const auth = service();
    const login = auth.login('coach@example.com', 'password123', {
      deviceId: 'iphone-2',
      platform: 'ios',
    });
    if (!login) throw new Error('expected login');

    expect(auth.getMe(login.accessToken)?.user.email).toBe('coach@example.com');
    expect(auth.logoutByRefreshToken(login.refreshToken)).toBe(true);
    expect(auth.getMe(login.accessToken)).toBeNull();
  });
});
