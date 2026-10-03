import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getEncryptionKey(value) {
  if (Buffer.isBuffer(value) && value.length === 32) return value;
  if (typeof value === 'string' && /^[\da-f]{64}$/i.test(value)) {
    return Buffer.from(value, 'hex');
  }
  throw new Error('OAuth token encryption key must be 32 bytes encoded as 64 hexadecimal characters');
}

function requireIdentifier(value, name) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`OAuth token store requires ${name}`);
  }
  return value.trim();
}

function encrypt(value, key) {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(value), 'utf8'),
    cipher.final(),
  ]);
  return JSON.stringify({
    iv: iv.toString('base64url'),
    tag: cipher.getAuthTag().toString('base64url'),
    ciphertext: ciphertext.toString('base64url'),
  });
}

function decrypt(encrypted, key) {
  const envelope = JSON.parse(encrypted);
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(envelope.iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(envelope.tag, 'base64url'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(envelope.ciphertext, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
  return JSON.parse(plaintext);
}

export function createOauthTokenStore({
  repository,
  encryptionKey,
  now = Date.now,
  auditLogger,
} = {}) {
  if (!repository || typeof repository.get !== 'function'
    || typeof repository.set !== 'function' || typeof repository.delete !== 'function') {
    throw new Error('OAuth token store requires a persistent repository');
  }
  const key = getEncryptionKey(encryptionKey);

  return {
    set(provider, tenantId, tokenSet) {
      const providerId = requireIdentifier(provider, 'provider');
      const tenant = requireIdentifier(tenantId, 'tenant identifier');
      if (!tokenSet || typeof tokenSet !== 'object' || Array.isArray(tokenSet)
        || typeof tokenSet.accessToken !== 'string' || !tokenSet.accessToken) {
        throw new Error('OAuth token set requires a non-empty accessToken');
      }
      if (tokenSet.expiresAt !== undefined
        && (!Number.isFinite(tokenSet.expiresAt) || tokenSet.expiresAt <= 0)) {
        throw new Error('OAuth token expiry must be a positive timestamp');
      }
      repository.set(providerId, tenant, encrypt(tokenSet, key));
      auditLogger?.log?.({ type: 'oauth-token.store', provider: providerId, tenantId: tenant });
    },
    get(provider, tenantId) {
      const providerId = requireIdentifier(provider, 'provider');
      const tenant = requireIdentifier(tenantId, 'tenant identifier');
      const encrypted = repository.get(providerId, tenant);
      if (!encrypted) return null;
      const tokenSet = decrypt(encrypted, key);
      if (tokenSet.expiresAt && tokenSet.expiresAt <= now()) {
        repository.delete(providerId, tenant);
        auditLogger?.log?.({ type: 'oauth-token.expire', provider: providerId, tenantId: tenant });
        return null;
      }
      return tokenSet;
    },
    clear(provider, tenantId) {
      const providerId = requireIdentifier(provider, 'provider');
      const tenant = requireIdentifier(tenantId, 'tenant identifier');
      repository.delete(providerId, tenant);
      auditLogger?.log?.({ type: 'oauth-token.clear', provider: providerId, tenantId: tenant });
    },
  };
}
