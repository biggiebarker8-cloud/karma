import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createAssistantApp } from '../src/assistant/server/assistantApp.js';

const TEST_PASSWORD = 'safe-local-test-passphrase';

function makeApp(databasePath, executions) {
  return createAssistantApp({
    databasePath,
    sessionSecret: 'test-only-session-secret-value-at-least-32-bytes',
    danUserId: 'dan-user-42',
    danPassword: TEST_PASSWORD,
    secureCookies: false,
    runtimeOptions: {
      modelTransport: async ({ model }) => `${model} response`,
      claudeTransport: async ({ model }) => `${model} response`,
      featureFlagOverrides: { commerceEnabled: true },
    },
    configureRuntime(runtime) {
      runtime.pluginRegistry.register({
        id: 'commerce',
        async execute(action, context) {
          executions.push({ action, context });
          return 'completed';
        },
      });
    },
  });
}

async function start(app) {
  const address = await app.listen();
  return `http://${address.address}:${address.port}`;
}

function client(baseUrl, cookie, csrfToken) {
  return async (path, { method = 'GET', body, origin = baseUrl, csrf = csrfToken, headers = {} } = {}) => {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        ...(cookie ? { cookie } : {}),
        ...(origin ? { origin } : {}),
        ...(csrf ? { 'x-csrf-token': csrf } : {}),
        ...(body === undefined ? {} : { 'content-type': 'application/json' }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return {
      response,
      body: response.status === 204 ? {} : await response.json(),
    };
  };
}

test('host app authenticates, enforces CSRF, and persists history and single-use approvals across restart', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'karma-assistant-'));
  const databasePath = join(directory, 'assistant.sqlite');
  const executions = [];
  let app = makeApp(databasePath, executions);
  let baseUrl = await start(app);
  let call = client(baseUrl);
  t.after(async () => {
    await app.close();
    await rm(directory, { recursive: true, force: true });
  });

  const page = await fetch(baseUrl);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Two-assistant chat/);
  assert.equal((await fetch(`${baseUrl}/app.js`)).status, 200);

  assert.equal((await call('/api/assistant/session')).response.status, 401);
  const forged = await call('/api/assistant/history?profile=karma', {
    headers: { 'x-user-id': 'dan-user-42' },
  });
  assert.equal(forged.response.status, 401);
  assert.equal((await call('/api/login', {
    method: 'POST',
    origin: 'https://attacker.example',
    body: { password: TEST_PASSWORD },
  })).response.status, 403);
  assert.equal((await call('/api/login', {
    method: 'POST',
    body: { password: 'wrong password' },
  })).response.status, 401);

  const login = await call('/api/login', {
    method: 'POST',
    body: { password: TEST_PASSWORD },
  });
  assert.equal(login.response.status, 200);
  const setCookie = login.response.headers.get('set-cookie');
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /SameSite=Strict/);
  const cookie = setCookie.split(';', 1)[0];
  const csrfToken = login.body.csrfToken;
  call = client(baseUrl, cookie, csrfToken);
  assert.equal((await call('/api/assistant/session')).body.user.id, 'dan-user-42');
  assert.equal((await call('/api/assistant/shared-facts', {
    method: 'POST',
    body: { fact: 'CSRF must be checked' },
    csrf: '',
  })).response.status, 403);
  assert.equal((await call('/api/assistant/shared-facts', {
    method: 'POST',
    body: { fact: 'CSRF must be checked' },
    csrf: 'invalid-token',
  })).response.status, 403);
  assert.equal((await call('/api/assistant/shared-facts', {
    method: 'POST',
    origin: 'https://attacker.example',
    body: { fact: 'Cross-site request' },
  })).response.status, 403);

  const chat = await call('/api/assistant/chat', {
    method: 'POST',
    body: { mode: 'together', prompt: 'Keep this after restart' },
  });
  assert.equal(chat.response.status, 200);
  assert.equal(chat.body.replies.length, 2);

  const proposal = await call('/api/assistant/shared-facts', {
    method: 'POST',
    body: { fact: 'Durable shared fact', identity: { id: 'forged-user' } },
  });
  assert.equal(proposal.response.status, 201);
  assert.equal((await call('/api/assistant/shared-facts/review', {
    method: 'POST',
    body: { id: proposal.body.fact.id, approved: true, identity: { id: 'forged-user' } },
  })).response.status, 200);

  const requested = await call('/api/assistant/approvals', {
    method: 'POST',
    body: {
      profile: 'karma',
      pluginId: 'commerce',
      action: 'spend',
      context: { amount: 25, purpose: 'restart test' },
    },
  });
  assert.equal(requested.response.status, 201);
  const approvalId = requested.body.approval.id;
  assert.equal((await call('/api/assistant/approvals/approve', {
    method: 'POST',
    body: { id: approvalId, identity: { id: 'forged-user' } },
  })).response.status, 200);

  const pendingRequest = await call('/api/assistant/approvals', {
    method: 'POST',
    body: {
      profile: 'collaborator',
      pluginId: 'commerce',
      action: 'spend',
      context: { amount: 1 },
    },
  });
  const pendingId = pendingRequest.body.approval.id;

  await app.close();
  app = makeApp(databasePath, executions);
  baseUrl = await start(app);
  call = client(baseUrl, cookie, csrfToken);

  const restored = await call('/api/assistant/history?profile=karma');
  assert.equal(restored.response.status, 200);
  assert.equal(restored.response.headers.get('cache-control'), 'no-store');
  assert.match(JSON.stringify(restored.body.history), /Keep this after restart/);
  const shared = await call('/api/assistant/shared-facts');
  assert.deepEqual(shared.body.approved, ['Durable shared fact']);
  const pendingApprovals = await call('/api/assistant/approvals');
  assert.equal(pendingApprovals.body.approvals.some(({ id }) => id === pendingId), true);

  const action = {
    profile: 'karma',
    pluginId: 'commerce',
    action: 'spend',
    context: { amount: 25, purpose: 'restart test', approvalId },
  };
  assert.equal((await call('/api/assistant/tools', {
    method: 'POST',
    body: action,
  })).response.status, 200);
  assert.equal((await call('/api/assistant/tools', {
    method: 'POST',
    body: action,
  })).response.status, 403);
  assert.equal(executions.length, 1);
  assert.equal((await call('/api/assistant/approvals/approve', {
    method: 'POST',
    body: { id: approvalId },
  })).response.status, 400);

  assert.equal((await call('/api/assistant/logout', {
    method: 'POST',
    body: {},
  })).response.status, 200);
  assert.equal((await call('/api/assistant/session')).response.status, 401);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    assert.equal((await call('/api/login', {
      method: 'POST',
      body: { password: 'wrong password' },
    })).response.status, 401);
  }
  assert.equal((await call('/api/login', {
    method: 'POST',
    body: { password: 'wrong password' },
  })).response.status, 429);
});
