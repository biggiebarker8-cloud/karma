import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createAssistantRuntime } from '../index.js';
import { createAssistantHttpHandler } from './assistantHttpHandler.js';
import { createAssistantSqliteStorage } from './sqliteStorage.js';
import { createSessionAuth, isSameOriginRequest } from './sessionAuth.js';

const HTML_PATH = fileURLToPath(new URL('../../../public/index.html', import.meta.url));
const SCRIPT_PATH = fileURLToPath(new URL('../../../public/app.js', import.meta.url));
const STYLES_PATH = fileURLToPath(new URL('../../../public/app.css', import.meta.url));
const STATIC_ASSETS = new Map([
  ['/', [HTML_PATH, 'text/html; charset=utf-8']],
  ['/app.js', [SCRIPT_PATH, 'text/javascript; charset=utf-8']],
  ['/app.css', [STYLES_PATH, 'text/css; charset=utf-8']],
  ['/manifest.json', [
    fileURLToPath(new URL('../../../public/manifest.json', import.meta.url)),
    'application/manifest+json; charset=utf-8',
  ]],
  ['/service-worker.js', [
    fileURLToPath(new URL('../../../public/service-worker.js', import.meta.url)),
    'text/javascript; charset=utf-8',
  ]],
  ['/icons/apple-touch-icon.png', [
    fileURLToPath(new URL('../../../public/icons/apple-touch-icon.png', import.meta.url)),
    'image/png',
  ]],
  ['/icons/icon-192.png', [
    fileURLToPath(new URL('../../../public/icons/icon-192.png', import.meta.url)),
    'image/png',
  ]],
  ['/icons/icon-512.png', [
    fileURLToPath(new URL('../../../public/icons/icon-512.png', import.meta.url)),
    'image/png',
  ]],
]);
const MAX_BODY_BYTES = 64 * 1024;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_ATTEMPT_LIMIT = 5;
const MAX_LOGIN_IN_FLIGHT = 4;
const MAX_LOGIN_IN_FLIGHT_PER_IP = 2;
const SECURITY_HEADERS = {
  'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
  'referrer-policy': 'same-origin',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'cache-control': 'no-store',
};

function sendJson(response, status, value, headers = {}) {
  response.writeHead(status, {
    ...SECURITY_HEADERS,
    'content-type': 'application/json; charset=utf-8',
    ...headers,
  });
  response.end(JSON.stringify(value));
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      const error = new Error('Request body is too large');
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  let body;
  try {
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    const error = new Error('A valid JSON object is required');
    error.status = 400;
    throw error;
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    const error = new Error('A JSON object is required');
    error.status = 400;
    throw error;
  }
  return body;
}

async function sendFile(response, path, contentType) {
  try {
    const content = await readFile(path);
    response.writeHead(200, {
      ...SECURITY_HEADERS,
      'content-type': contentType,
      'cache-control': 'no-cache',
    });
    response.end(content);
  } catch {
    sendJson(response, 404, { error: 'Not found' });
  }
}

export function createAssistantApp({
  databasePath,
  sessionSecret,
  danUserId,
  danPassword,
  secureCookies = true,
  publicOrigin,
  runtimeOptions = {},
  configureRuntime,
} = {}) {
  if (!runtimeOptions.modelTransport && !process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required to start the assistant app');
  }
  if (!runtimeOptions.claudeTransport && !process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is required to start the assistant app');
  }
  const originUrl = publicOrigin ? new URL(publicOrigin) : null;
  if (originUrl && (!['http:', 'https:'].includes(originUrl.protocol)
    || originUrl.username || originUrl.password
    || originUrl.pathname !== '/' || originUrl.search || originUrl.hash)) {
    throw new Error('PUBLIC_ORIGIN must be an HTTP(S) origin without a path');
  }
  const configuredOrigin = originUrl?.origin ?? null;

  const storage = createAssistantSqliteStorage(databasePath);
  let auth;
  let assistantHandler;
  const loginAttempts = new Map();
  let activeLoginAttempts = 0;
  try {
    auth = createSessionAuth({
      sessionStore: storage.sessionStore,
      secret: sessionSecret,
      danUserId,
      danPassword,
      secureCookies,
    });
    const runtime = createAssistantRuntime({
      ...runtimeOptions,
      memoryStore: storage.memoryStore,
      approvalStore: storage.approvalStore,
      integrationTokenRepository: storage.integrationTokenRepository,
      authorizeDanAction: (_operation, identity) => identity?.id === danUserId,
    });
    configureRuntime?.(runtime);
    assistantHandler = createAssistantHttpHandler({
      assistantProfiles: runtime.assistantProfiles,
      getAuthenticatedIdentity: (request) => auth.identityFromCookie(request.headers.get('cookie')),
      danUserId,
    });

    const server = createServer({
      headersTimeout: 10_000,
      requestTimeout: 30_000,
    }, async (request, response) => {
      try {
        const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
        const expectedOrigin = configuredOrigin
          ?? `${request.socket.encrypted ? 'https' : 'http'}://${request.headers.host ?? 'localhost'}`;
        const asset = STATIC_ASSETS.get(url.pathname);
        if (request.method === 'GET' && asset) {
          await sendFile(response, ...asset);
          return;
        }
        if (url.pathname === '/api/login' && request.method === 'POST') {
          if (!isSameOriginRequest(expectedOrigin, request.headers.origin)) {
            sendJson(response, 403, { error: 'Same-origin request required' });
            return;
          }
          const address = request.socket.remoteAddress ?? 'unknown';
          const now = Date.now();
          for (const [ip, value] of loginAttempts) {
            if (value.inFlight === 0 && value.startedAt + LOGIN_WINDOW_MS <= now) {
              loginAttempts.delete(ip);
            }
          }
          let attempt = loginAttempts.get(address);
          if (attempt && attempt.startedAt + LOGIN_WINDOW_MS <= now && attempt.inFlight === 0) {
            loginAttempts.delete(address);
            attempt = undefined;
          } else if (attempt && attempt.startedAt + LOGIN_WINDOW_MS <= now) {
            attempt.startedAt = now;
            attempt.failures = 0;
          }
          if (attempt?.failures >= LOGIN_ATTEMPT_LIMIT) {
            sendJson(response, 429, { error: 'Too many sign-in attempts; try again later' });
            return;
          }
          const body = await readJsonBody(request);
          attempt = loginAttempts.get(address) ?? {
            startedAt: Date.now(),
            failures: 0,
            inFlight: 0,
          };
          if (attempt.inFlight >= MAX_LOGIN_IN_FLIGHT_PER_IP
            || activeLoginAttempts >= MAX_LOGIN_IN_FLIGHT) {
            sendJson(response, 429, { error: 'Too many sign-in attempts; try again later' });
            return;
          }
          if (!loginAttempts.has(address) && loginAttempts.size >= 4096) {
            const evictable = Array.from(loginAttempts).find(([, value]) => value.inFlight === 0);
            if (evictable) loginAttempts.delete(evictable[0]);
            else {
              sendJson(response, 429, { error: 'Too many sign-in attempts; try again later' });
              return;
            }
          }
          attempt.inFlight += 1;
          activeLoginAttempts += 1;
          loginAttempts.set(address, attempt);
          let session;
          try {
            session = await auth.authenticate(body.password);
          } finally {
            attempt.inFlight -= 1;
            activeLoginAttempts -= 1;
          }
          if (!session) {
            attempt.failures += 1;
            loginAttempts.set(address, attempt);
            sendJson(response, 401, { error: 'Invalid password' });
            return;
          }
          loginAttempts.delete(address);
          sendJson(response, 200, {
            user: session.user,
            csrfToken: session.csrfToken,
          }, { 'set-cookie': session.cookie });
          return;
        }

        if (!url.pathname.startsWith('/api/assistant/')) {
          sendJson(response, 404, { error: 'Not found' });
          return;
        }
        const identity = auth.identityFromCookie(request.headers.cookie);
        if (!identity) {
          sendJson(response, 401, { error: 'Authentication required' });
          return;
        }
        if (request.method === 'GET' && url.pathname === '/api/assistant/session') {
          sendJson(response, 200, {
            user: { id: identity.id },
            canReview: identity.id === danUserId,
            csrfToken: identity.csrfToken,
          });
          return;
        }
        if (request.method === 'POST') {
          if (!isSameOriginRequest(expectedOrigin, request.headers.origin)) {
            sendJson(response, 403, { error: 'Same-origin request required' });
            return;
          }
          if (!auth.verifyCsrf(identity, request.headers['x-csrf-token'])) {
            sendJson(response, 403, { error: 'CSRF token is missing or invalid' });
            return;
          }
          if (url.pathname === '/api/assistant/logout') {
            auth.revoke(identity);
            sendJson(response, 200, { loggedOut: true }, { 'set-cookie': auth.clearCookie() });
            return;
          }
        }

        const chunks = [];
        let size = 0;
        for await (const chunk of request) {
          size += chunk.length;
          if (size > MAX_BODY_BYTES) {
            sendJson(response, 413, { error: 'Request body is too large' });
            return;
          }
          chunks.push(chunk);
        }
        const headers = new Headers();
        for (const [name, value] of Object.entries(request.headers)) {
          if (Array.isArray(value)) headers.set(name, value.join(', '));
          else if (value !== undefined) headers.set(name, value);
        }
        const method = request.method ?? 'GET';
        const body = chunks.length ? Buffer.concat(chunks) : undefined;
        const webRequest = new Request(url, {
          method,
          headers,
          body,
          ...(body ? { duplex: 'half' } : {}),
        });
        const result = await assistantHandler(webRequest);
        response.writeHead(result.status, {
          ...SECURITY_HEADERS,
          'cache-control': 'no-store',
          ...Object.fromEntries(result.headers.entries()),
        });
        response.end(Buffer.from(await result.arrayBuffer()));
      } catch (error) {
        if (!response.headersSent) {
          sendJson(response, error.status || 500, {
            error: error.status ? error.message : 'Internal server error',
          });
        } else {
          response.destroy();
        }
      }
    });

    return {
      server,
      storage,
      listen(port = 0, host = '127.0.0.1') {
        return new Promise((resolve, reject) => {
          server.once('error', reject);
          server.listen(port, host, () => {
            server.removeListener('error', reject);
            resolve(server.address());
          });
        });
      },
      close() {
        return new Promise((resolve, reject) => {
          server.close((error) => {
            storage.close();
            if (error) reject(error);
            else resolve();
          });
        });
      },
    };
  } catch (error) {
    storage.close();
    throw error;
  }
}
