import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export type DeviceMetadata = {
  deviceId: string;
  platform: string;
  appVersion?: string;
  userAgent?: string;
  ip?: string;
};

export type SessionRecord = {
  sessionId: string;
  userId: string;
  createdAt: number;
  lastSeenAt: number;
  device: DeviceMetadata;
  revokedAt?: number;
  revokedReason?: string;
  currentRefreshTokenHash: string;
  previousRefreshTokenHashes: Set<string>;
};

type AccessTokenPayload = {
  tokenId: string;
  userId: string;
  sessionId: string;
  exp: number;
};

export type AuthUser = {
  id: string;
  email: string;
  password: string;
  displayName: string;
};

export type AuthConfig = {
  accessTokenTtlMs: number;
  refreshTokenTtlMs: number;
};

const DEFAULT_CONFIG: AuthConfig = {
  accessTokenTtlMs: 15 * 60 * 1000,
  refreshTokenTtlMs: 14 * 24 * 60 * 60 * 1000,
};

export class AuthService {
  private readonly usersByEmail = new Map<string, AuthUser>();
  private readonly usersById = new Map<string, AuthUser>();
  private readonly sessions = new Map<string, SessionRecord>();
  private readonly refreshIndex = new Map<string, { sessionId: string; expiresAt: number }>();
  private readonly config: AuthConfig;

  constructor(users: AuthUser[], config: Partial<AuthConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    for (const user of users) {
      this.usersByEmail.set(user.email.toLowerCase(), user);
      this.usersById.set(user.id, user);
    }
  }

  login(email: string, password: string, device: DeviceMetadata) {
    const user = this.usersByEmail.get(email.toLowerCase());
    if (!user || user.password !== password) {
      return null;
    }

    const now = Date.now();
    const sessionId = randomId('sess');
    const refreshToken = randomToken('rfr');
    const refreshHash = hashToken(refreshToken);
    const session: SessionRecord = {
      sessionId,
      userId: user.id,
      createdAt: now,
      lastSeenAt: now,
      device,
      currentRefreshTokenHash: refreshHash,
      previousRefreshTokenHashes: new Set(),
    };

    this.sessions.set(sessionId, session);
    this.refreshIndex.set(refreshHash, { sessionId, expiresAt: now + this.config.refreshTokenTtlMs });

    return this.issueTokenPair(sessionId, user.id, refreshToken);
  }

  refresh(refreshToken: string, device?: Partial<DeviceMetadata>) {
    const tokenHash = hashToken(refreshToken);
    const indexed = this.refreshIndex.get(tokenHash);
    if (!indexed || indexed.expiresAt <= Date.now()) {
      return { ok: false as const, code: 'invalid_refresh' };
    }

    const session = this.sessions.get(indexed.sessionId);
    if (!session || session.revokedAt) {
      return { ok: false as const, code: 'session_revoked' };
    }

    if (session.previousRefreshTokenHashes.has(tokenHash)) {
      this.revokeSession(session.sessionId, 'refresh_token_reuse_detected');
      return { ok: false as const, code: 'refresh_reuse_detected' };
    }

    if (!safeEquals(session.currentRefreshTokenHash, tokenHash)) {
      this.revokeSession(session.sessionId, 'refresh_token_mismatch');
      return { ok: false as const, code: 'refresh_reuse_detected' };
    }

    session.previousRefreshTokenHashes.add(tokenHash);
    this.refreshIndex.delete(tokenHash);

    const newRefreshToken = randomToken('rfr');
    const newHash = hashToken(newRefreshToken);
    session.currentRefreshTokenHash = newHash;
    session.lastSeenAt = Date.now();
    session.device = { ...session.device, ...device };
    this.refreshIndex.set(newHash, { sessionId: session.sessionId, expiresAt: Date.now() + this.config.refreshTokenTtlMs });

    return { ok: true as const, ...this.issueTokenPair(session.sessionId, session.userId, newRefreshToken) };
  }

  logoutByRefreshToken(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    const indexed = this.refreshIndex.get(tokenHash);
    if (!indexed) {
      return false;
    }
    return this.revokeSession(indexed.sessionId, 'user_logout');
  }

  logoutByAccessToken(accessToken: string) {
    const payload = this.parseAccessToken(accessToken);
    if (!payload) {
      return false;
    }
    return this.revokeSession(payload.sessionId, 'user_logout');
  }

  getMe(accessToken: string) {
    const payload = this.parseAccessToken(accessToken);
    if (!payload) return null;
    const session = this.sessions.get(payload.sessionId);
    if (!session || session.revokedAt) return null;
    const user = this.usersById.get(payload.userId);
    if (!user) return null;

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
      session: {
        sessionId: session.sessionId,
        createdAt: session.createdAt,
        lastSeenAt: session.lastSeenAt,
        device: session.device,
      },
    };
  }

  private parseAccessToken(token: string): AccessTokenPayload | null {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return null;
    const expected = sign(payloadB64);
    if (!safeEquals(signature, expected)) return null;

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as AccessTokenPayload;
    if (payload.exp <= Date.now()) return null;
    return payload;
  }

  private issueTokenPair(sessionId: string, userId: string, refreshToken: string) {
    const payload: AccessTokenPayload = {
      tokenId: randomId('atk'),
      userId,
      sessionId,
      exp: Date.now() + this.config.accessTokenTtlMs,
    };
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const accessToken = `${payloadB64}.${sign(payloadB64)}`;

    return {
      accessToken,
      refreshToken,
      expiresInMs: this.config.accessTokenTtlMs,
      refreshExpiresInMs: this.config.refreshTokenTtlMs,
      tokenType: 'Bearer' as const,
    };
  }

  private revokeSession(sessionId: string, reason: string) {
    const session = this.sessions.get(sessionId);
    if (!session || session.revokedAt) {
      return false;
    }

    session.revokedAt = Date.now();
    session.revokedReason = reason;
    this.refreshIndex.delete(session.currentRefreshTokenHash);
    for (const previous of session.previousRefreshTokenHashes) {
      this.refreshIndex.delete(previous);
    }

    return true;
  }
}

function randomToken(prefix: string) {
  return `${prefix}_${randomBytes(48).toString('base64url')}`;
}

function randomId(prefix: string) {
  return `${prefix}_${randomBytes(16).toString('hex')}`;
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

const SIGNING_KEY = createHash('sha256').update('head-coach-dream-api-auth-v1').digest('hex');

function sign(payloadB64: string) {
  return createHash('sha256').update(`${payloadB64}.${SIGNING_KEY}`).digest('base64url');
}

function safeEquals(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
