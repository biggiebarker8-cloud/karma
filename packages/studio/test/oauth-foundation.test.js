import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { createOauthTokenStore } from '../src/assistant/plugins/oauthTokenStore.js';
import { createOauthTransactionStore } from '../src/assistant/plugins/oauthTransactionStore.js';
import { createAssistantSqliteStorage } from '../src/assistant/server/sqliteStorage.js';

const encryptionKey = 'a'.repeat(64);

test('OAuth token sets persist encrypted and isolated by provider and tenant', () => {
  const directory = mkdtempSync(join(tmpdir(), 'karma-oauth-'));
  const databasePath = join(directory, 'assistant.sqlite');
  let storage = createAssistantSqliteStorage(databasePath);
  let tokenStore = createOauthTokenStore({
    repository: storage.integrationTokenRepository,
    encryptionKey,
  });

  tokenStore.set('github', 'tenant-a', {
    accessToken: 'secret-token',
    expiresAt: Date.now() + 60_000,
    scopes: ['contents:read'],
  });
  assert.equal(tokenStore.get('github', 'tenant-a').accessToken, 'secret-token');
  assert.equal(tokenStore.get('github', 'tenant-b'), null);
  assert.equal(tokenStore.get('shopify', 'tenant-a'), null);
  assert.equal(
    storage.integrationTokenRepository.get('github', 'tenant-a').includes('secret-token'),
    false,
  );
  storage.close();

  storage = createAssistantSqliteStorage(databasePath);
  tokenStore = createOauthTokenStore({
    repository: storage.integrationTokenRepository,
    encryptionKey,
  });
  assert.equal(tokenStore.get('github', 'tenant-a').accessToken, 'secret-token');
  tokenStore.clear('github', 'tenant-a');
  assert.equal(tokenStore.get('github', 'tenant-a'), null);
  storage.close();
  rmSync(directory, { recursive: true, force: true });
});

test('OAuth token store rejects invalid keys and expires tokens', () => {
  const tokens = new Map();
  const repository = {
    get: (provider, tenant) => tokens.get(`${provider}:${tenant}`) ?? null,
    set: (provider, tenant, value) => tokens.set(`${provider}:${tenant}`, value),
    delete: (provider, tenant) => tokens.delete(`${provider}:${tenant}`),
  };
  assert.throws(() => createOauthTokenStore({ repository, encryptionKey: 'bad' }), /32 bytes/);
  let now = 100;
  const store = createOauthTokenStore({ repository, encryptionKey, now: () => now });
  store.set('github', 'tenant-a', { accessToken: 'secret', expiresAt: 200 });
  now = 200;
  assert.equal(store.get('github', 'tenant-a'), null);
  assert.equal(tokens.size, 0);
});

test('OAuth transactions validate redirects, bind provider and tenant, and are one-time', () => {
  let now = 1_000;
  const store = createOauthTransactionStore({ now: () => now, ttlMs: 500 });
  assert.throws(() => store.create({
    provider: 'github',
    tenantId: 'tenant-a',
    redirectUri: 'https://attacker.example/callback',
    allowedRedirectUris: ['https://app.example/callback'],
  }), /not allowlisted/);

  const transaction = store.create({
    provider: 'github',
    tenantId: 'tenant-a',
    redirectUri: 'https://app.example/callback',
    allowedRedirectUris: ['https://app.example/callback'],
    scopes: ['read:user', 'repo'],
  });
  assert.equal(transaction.state.length > 32, true);
  assert.equal(transaction.codeChallenge.length > 32, true);
  assert.equal(store.consume({
    ...transaction,
    provider: 'github',
    tenantId: 'tenant-b',
    redirectUri: transaction.redirectUri,
  }), null);
  assert.equal(store.consume({
    ...transaction,
    provider: 'github',
    tenantId: 'tenant-a',
    redirectUri: transaction.redirectUri,
  }), null);

  const valid = store.create({
    provider: 'github',
    tenantId: 'tenant-a',
    redirectUri: 'https://app.example/callback',
    allowedRedirectUris: ['https://app.example/callback'],
    scopes: ['read:user'],
  });
  const consumed = store.consume({
    state: valid.state,
    provider: 'github',
    tenantId: 'tenant-a',
    redirectUri: valid.redirectUri,
  });
  assert.deepEqual(consumed.scopes, ['read:user']);
  assert.equal(
    createHash('sha256').update(consumed.codeVerifier).digest('base64url'),
    valid.codeChallenge,
  );
  assert.equal(store.consume({
    state: valid.state,
    provider: 'github',
    tenantId: 'tenant-a',
    redirectUri: valid.redirectUri,
  }), null);

  const expiring = store.create({
    provider: 'github',
    tenantId: 'tenant-a',
    redirectUri: 'https://app.example/callback',
    allowedRedirectUris: ['https://app.example/callback'],
  });
  now += 500;
  assert.equal(store.consume({
    state: expiring.state,
    provider: 'github',
    tenantId: 'tenant-a',
    redirectUri: expiring.redirectUri,
  }), null);
});
