import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';

const SESSION_COOKIE = 'karma_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function safeEqual(left, right) {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

export function readCookie(cookieHeader, name = SESSION_COOKIE) {
  for (const part of (cookieHeader ?? '').split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0 || part.slice(0, separator).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
}

export function createSessionAuth({
  sessionStore,
  secret,
  danUserId,
  danPassword,
  secureCookies = true,
  now = () => Date.now(),
} = {}) {
  if (!sessionStore || typeof secret !== 'string' || Buffer.byteLength(secret) < 32) {
    throw new Error('Session authentication requires a session store and a 32-byte SESSION_SECRET');
  }
  if (typeof danUserId !== 'string' || !danUserId
    || typeof danPassword !== 'string' || Buffer.byteLength(danPassword) < 12) {
    throw new Error('DAN_USER_ID and DAN_PASSWORD (at least 12 bytes) are required');
  }
  const secretBytes = Buffer.from(secret);
  const passwordHash = createHash('sha256').update(danPassword).digest();

  function signature(id) {
    return createHmac('sha256', secretBytes).update(id).digest('base64url');
  }

  function decodeToken(token) {
    if (typeof token !== 'string') return null;
    const separator = token.indexOf('.');
    if (separator < 1) return null;
    const id = token.slice(0, separator);
    const providedSignature = token.slice(separator + 1);
    if (!safeEqual(providedSignature, signature(id))) return null;
    return id;
  }

  function createCookie(token) {
    const flags = [
      `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Strict',
      `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
    ];
    if (secureCookies) flags.push('Secure');
    return flags.join('; ');
  }

  return {
    authenticate(password) {
      if (typeof password !== 'string') return null;
      const candidateHash = createHash('sha256').update(password).digest();
      if (!timingSafeEqual(candidateHash, passwordHash)) return null;
      const id = randomBytes(32).toString('base64url');
      const csrfToken = randomBytes(32).toString('base64url');
      const session = {
        id,
        userId: danUserId,
        csrfToken,
        expiresAt: now() + SESSION_TTL_MS,
      };
      sessionStore.create(session);
      return {
        cookie: createCookie(`${id}.${signature(id)}`),
        csrfToken,
        user: { id: danUserId },
      };
    },

    identityFromCookie(cookieHeader) {
      const id = decodeToken(readCookie(cookieHeader));
      if (!id) return null;
      const session = sessionStore.get(id);
      if (!session) return null;
      return {
        id: session.user_id,
        csrfToken: session.csrf_token,
        sessionId: session.id,
      };
    },

    verifyCsrf(identity, token) {
      return Boolean(identity && typeof token === 'string'
        && safeEqual(token, identity.csrfToken));
    },

    revoke(identity) {
      if (identity?.sessionId) sessionStore.delete(identity.sessionId);
    },

    clearCookie() {
      return [
        `${SESSION_COOKIE}=`,
        'Path=/',
        'HttpOnly',
        'SameSite=Strict',
        'Max-Age=0',
        ...(secureCookies ? ['Secure'] : []),
      ].join('; ');
    },
  };
}

export function isSameOriginRequest(requestUrl, originHeader) {
  if (typeof originHeader !== 'string') return false;
  try {
    return new URL(originHeader).origin === new URL(requestUrl).origin;
  } catch {
    return false;
  }
}
