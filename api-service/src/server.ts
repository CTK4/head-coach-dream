import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { AuthService, type DeviceMetadata } from './authService';

const authService = new AuthService([
  {
    id: 'user_1',
    email: 'coach@example.com',
    password: 'password123',
    displayName: 'Coach Prime',
  },
]);

export function createApiServer() {
  return createServer(async (req, res) => {
    setCorsHeaders(res);
    if (req.method === 'OPTIONS') {
      res.writeHead(204).end();
      return;
    }

    if (req.url === '/auth/login' && req.method === 'POST') {
      const body = await readJson(req);
      const device = buildDevice(req, body?.device);
      const result = authService.login(body?.email ?? '', body?.password ?? '', device);
      if (!result) return json(res, 401, { error: 'invalid_credentials' });
      return json(res, 200, { ...result, session: { device } });
    }

    if (req.url === '/auth/refresh' && req.method === 'POST') {
      const body = await readJson(req);
      const result = authService.refresh(body?.refreshToken ?? '', body?.device ?? undefined);
      if (!result.ok) {
        return json(res, 401, { error: result.code });
      }
      return json(res, 200, result);
    }

    if (req.url === '/auth/logout' && req.method === 'POST') {
      const body = await readJson(req);
      const token = extractBearer(req);
      const byRefresh = body?.refreshToken ? authService.logoutByRefreshToken(body.refreshToken) : false;
      const byAccess = token ? authService.logoutByAccessToken(token) : false;
      if (!byRefresh && !byAccess) {
        return json(res, 400, { error: 'no_valid_session' });
      }
      return json(res, 200, { ok: true });
    }

    if (req.url === '/me' && req.method === 'GET') {
      const token = extractBearer(req);
      if (!token) return json(res, 401, { error: 'missing_token' });
      const me = authService.getMe(token);
      if (!me) return json(res, 401, { error: 'invalid_token' });
      return json(res, 200, me);
    }

    return json(res, 404, { error: 'not_found' });
  });
}

function extractBearer(req: IncomingMessage) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const [scheme, token] = auth.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
  });
}

function buildDevice(req: IncomingMessage, input: Partial<DeviceMetadata>): DeviceMetadata {
  return {
    deviceId: input?.deviceId ?? 'unknown-device',
    platform: input?.platform ?? 'unknown',
    appVersion: input?.appVersion,
    userAgent: req.headers['user-agent'] ?? input?.userAgent,
    ip: getIp(req),
  };
}

function getIp(req: IncomingMessage) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0]?.trim();
  }
  return req.socket.remoteAddress;
}

function setCorsHeaders(res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(status).end(JSON.stringify(body));
}

if (process.env.START_API_SERVICE === '1') {
  const port = Number(process.env.PORT || 8787);
  createApiServer().listen(port, () => {
    console.log(`api-service listening on :${port}`);
  });
}
