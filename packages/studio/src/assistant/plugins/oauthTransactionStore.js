import { createHash, randomBytes } from 'node:crypto';

const DEFAULT_TTL_MS = 10 * 60 * 1000;

function requireValue(value, name) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`OAuth transaction requires ${name}`);
  }
  return value.trim();
}

function validateRedirectUri(redirectUri, allowedRedirectUris) {
  const redirect = requireValue(redirectUri, 'redirect URI');
  if (!Array.isArray(allowedRedirectUris) || !allowedRedirectUris.includes(redirect)) {
    throw new Error('OAuth redirect URI is not allowlisted');
  }
  const parsed = new URL(redirect);
  if (!['http:', 'https:'].includes(parsed.protocol)
    || parsed.username || parsed.password || parsed.hash) {
    throw new Error('OAuth redirect URI must be a safe HTTP(S) URL');
  }
  return redirect;
}

export function createOauthTransactionStore({ now = Date.now, ttlMs = DEFAULT_TTL_MS } = {}) {
  if (!Number.isFinite(ttlMs) || ttlMs <= 0) {
    throw new Error('OAuth transaction lifetime must be positive');
  }
  const transactions = new Map();

  return {
    create({ provider, tenantId, redirectUri, allowedRedirectUris, scopes = [] } = {}) {
      const providerId = requireValue(provider, 'provider');
      const tenant = requireValue(tenantId, 'tenant identifier');
      const redirect = validateRedirectUri(redirectUri, allowedRedirectUris);
      if (!Array.isArray(scopes) || scopes.some((scope) => typeof scope !== 'string' || !scope.trim())) {
        throw new Error('OAuth scopes must be non-empty strings');
      }
      const state = randomBytes(32).toString('base64url');
      const codeVerifier = randomBytes(32).toString('base64url');
      const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');
      transactions.set(state, {
        provider: providerId,
        tenantId: tenant,
        redirectUri: redirect,
        scopes: [...new Set(scopes.map((scope) => scope.trim()))],
        codeVerifier,
        expiresAt: now() + ttlMs,
      });
      return { state, codeChallenge, redirectUri: redirect };
    },
    consume({ state, provider, tenantId, redirectUri } = {}) {
      if (typeof state !== 'string') return null;
      const transaction = transactions.get(state);
      if (!transaction) return null;
      transactions.delete(state);
      if (transaction.expiresAt <= now()
        || transaction.provider !== provider
        || transaction.tenantId !== tenantId
        || transaction.redirectUri !== redirectUri) {
        return null;
      }
      const { codeVerifier, scopes } = transaction;
      return { codeVerifier, scopes };
    },
  };
}
