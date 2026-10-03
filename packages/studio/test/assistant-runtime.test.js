import assert from 'node:assert/strict';
import test from 'node:test';

import { createAssistantRuntime as canonicalRuntime } from '../src/assistant/index.js';
import { createAssistantRuntime as compatibilityRuntime } from '../src/assistant/index.mjs';
import { PERMISSIONS } from '../src/assistant/core/permissions.js';
import { createModelGateway } from '../src/assistant/model/modelGateway.js';
import { createOpenAITransport } from '../src/assistant/model/openaiTransport.js';
import { createClaudeTransport } from '../src/assistant/model/claudeTransport.js';
import { createGitHubTransport } from '../src/assistant/github/githubTransport.js';
import { createAssistantHttpHandler } from '../src/assistant/server/assistantHttpHandler.js';

function createRuntime(permissions = [PERMISSIONS.DESIGN_COMICS], options = {}) {
  return canonicalRuntime({
    modelTransport: async () => 'ok',
    claudeTransport: async () => 'karma ok',
    permissions,
    authorizeDanAction: () => true,
    featureFlagOverrides: {
      pluginsEnabled: true,
      creativePluginsEnabled: true,
    },
    ...options,
  });
}

test('compatibility entrypoint exports the canonical runtime factory', () => {
  assert.strictEqual(compatibilityRuntime, canonicalRuntime);
});

test('agency and TikTok dashboard plans preserve the supplied organization distinctions', async () => {
  const runtime = createRuntime([PERMISSIONS.OPENCLAW_MANAGE]);

  const { workspace } = await runtime.pluginRegistry.execute(
    'openclaw',
    'setup-agency-workspace',
  );
  const { dashboard } = await runtime.pluginRegistry.execute(
    'openclaw',
    'setup-tiktok-dashboard',
  );

  for (const organization of [workspace.organization, dashboard.organization]) {
    assert.deepEqual(organization.legalEntity, {
      name: 'Creator Alliance Networks Pty Ltd',
      jurisdiction: 'Australia',
      abn: '55 700 905 157',
      acn: '700 905 157',
    });
    assert.equal(organization.officialDomain, 'https://creativealliancenetwork.com');
    assert.deepEqual(organization.separateProjects, [{
      name: 'Goated Guardians',
      relationship: 'separate internal/project name; not independently verified',
    }]);
    assert.deepEqual(organization.unverifiedAssociations, [
      'creatoralliance.org',
      'Caribbean Creators Alliance',
    ]);
  }
});

test('evidence register records only supplied material and labels unverified assessments', async () => {
  const runtime = createRuntime([PERMISSIONS.OPENCLAW_MANAGE]);
  const result = await runtime.pluginRegistry.execute('openclaw', 'create-evidence-register', {
    entries: [{
      sourceType: 'public-source',
      date: '2026-10-01',
      source: 'Public company register',
      fileOrScreenshotName: 'company-record.pdf',
      exactFactualClaim: 'The record lists the company as active.',
      whatEvidenceProves: 'The supplied record displays active status.',
      whatRemainsUnverified: 'Whether TikTok has an agency relationship with the company.',
      tikTokStatementCompared: 'No statement provided.',
      contradictionWithTikTok: 'No contradiction assessed.',
      relevance: 'May help establish the company identity.',
    }],
  });

  assert.equal(result.register.subject, 'Creator Alliance Networks Pty Ltd');
  assert.deepEqual(result.register.allowedSources, [
    'user-provided material',
    'independently verifiable public sources',
  ]);
  assert.equal(
    result.register.assessmentLimit,
    'This action records supplied information; it does not independently verify sources or claims.',
  );
  assert.deepEqual(result.register.entries[0], {
    sourceType: 'public-source',
    date: '2026-10-01',
    source: 'Public company register',
    fileOrScreenshotName: 'company-record.pdf',
    exactFactualClaim: 'The record lists the company as active.',
    whatEvidenceProves: 'The supplied record displays active status.',
    whatRemainsUnverified: 'Whether TikTok has an agency relationship with the company.',
    tikTokStatementCompared: 'No statement provided.',
    contradictionWithTikTok: 'No contradiction assessed.',
    relevance: 'May help establish the company identity.',
    verificationStatus: 'Not independently verified by this action',
  });
});

test('evidence register starts empty and rejects entries without source provenance', async () => {
  const runtime = createRuntime([PERMISSIONS.OPENCLAW_MANAGE]);
  const { register } = await runtime.pluginRegistry.execute(
    'openclaw',
    'create-evidence-register',
  );

  assert.deepEqual(register.entries, []);
  await assert.rejects(
    () => runtime.pluginRegistry.execute('openclaw', 'create-evidence-register', {
      entries: [{ exactFactualClaim: 'Unsupported claim' }],
    }),
    /must identify a user-provided or public source/,
  );
});

test('model gateway defaults to an OpenAI model', async () => {
  let request;
  const gateway = createModelGateway({
    transport: async (payload) => {
      request = payload;
      return 'ok';
    },
  });

  assert.equal(await gateway.complete({ prompt: 'Build this' }), 'ok');
  assert.equal(request.model, 'gpt-5');
});

test('model gateway routes Claude requests to the Claude transport', async () => {
  const calls = [];
  const gateway = createModelGateway({
    transport: async (payload) => {
      calls.push(['openai', payload]);
      return 'wrong transport';
    },
    claudeTransport: async (payload) => {
      calls.push(['claude', payload]);
      return 'claude response';
    },
  });

  assert.equal(
    await gateway.complete({ model: 'claude-sonnet-5', prompt: 'Design this' }),
    'claude response',
  );
  assert.equal(calls[0][0], 'claude');
  assert.equal(calls[0][1].model, 'claude-sonnet-5');
});

test('Claude transport uses its API key and returns message content', async () => {
  let claudeRequest;
  const claude = createClaudeTransport({
    apiKey: 'claude-test-key',
    fetchImpl: async (url, options) => {
      claudeRequest = { url, options };
      return { ok: true, async json() {
        return { content: [{ text: 'claude response' }] };
      } };
    },
  });

  assert.equal(await claude({ model: 'claude-sonnet-5', prompt: 'Hello' }), 'claude response');
  assert.equal(JSON.parse(claudeRequest.options.body).messages[0].role, 'user');
  assert.equal(claudeRequest.options.headers['x-api-key'], 'claude-test-key');
  assert.ok(claudeRequest.options.signal instanceof AbortSignal);
});

test('Claude transport rejects empty responses and times out stalled requests', async () => {
  const emptyResponse = createClaudeTransport({
    apiKey: 'test-key',
    fetchImpl: async () => ({
      ok: true,
      async json() { return { content: [{ type: 'tool_use' }] }; },
    }),
  });
  await assert.rejects(
    () => emptyResponse({ model: 'claude-sonnet-5', prompt: 'Hello' }),
    /non-empty message content/,
  );

  const stalledRequest = createClaudeTransport({
    apiKey: 'test-key',
    timeoutMs: 1,
    fetchImpl: async (_url, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    }),
  });
  const keepEventLoopAlive = setTimeout(() => {}, 100);
  try {
    await assert.rejects(
      () => stalledRequest({ model: 'claude-sonnet-5', prompt: 'Hello' }),
      { name: 'TimeoutError' },
    );
  } finally {
    clearTimeout(keepEventLoopAlive);
  }
});

test('Claude requests fail clearly without a Claude transport', async () => {
  const gateway = createModelGateway({ transport: async () => 'openai response' });

  await assert.rejects(
    () => gateway.complete({ model: 'claude-haiku-4.5', prompt: 'Hello' }),
    /require a Claude transport/,
  );
});

test('OpenAI transport sends a server-side key and returns chat content', async () => {
  let request;
  const transport = createOpenAITransport({
    apiKey: 'test-key',
    fetchImpl: async (url, options) => {
      request = { url, options };
      return {
        ok: true,
        async json() {
          return { choices: [{ message: { content: 'Hello from GPT' } }] };
        },
      };
    },
  });

  const result = await transport({ model: 'gpt-5', prompt: 'Help me build' });

  assert.equal(result, 'Hello from GPT');
  assert.equal(request.options.headers.authorization.startsWith('Bearer '), true);
  assert.equal(request.options.headers.authorization.endsWith('test-key'), true);
  assert.ok(request.options.signal instanceof AbortSignal);
  assert.deepStrictEqual(JSON.parse(request.options.body), {
    model: 'gpt-5',
    messages: [{ role: 'user', content: 'Help me build' }],
  });
});

test('OpenAI transport rejects empty responses and times out stalled requests', async () => {
  const emptyResponse = createOpenAITransport({
    apiKey: 'test-key',
    fetchImpl: async () => ({
      ok: true,
      async json() { return { choices: [{ message: { content: '  ' } }] }; },
    }),
  });
  await assert.rejects(
    () => emptyResponse({ model: 'gpt-5', prompt: 'Hello' }),
    /non-empty message content/,
  );

  const stalledRequest = createOpenAITransport({
    apiKey: 'test-key',
    timeoutMs: 1,
    fetchImpl: async (_url, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    }),
  });
  const keepEventLoopAlive = setTimeout(() => {}, 100);
  try {
    await assert.rejects(
      () => stalledRequest({ model: 'gpt-5', prompt: 'Hello' }),
      { name: 'TimeoutError' },
    );
  } finally {
    clearTimeout(keepEventLoopAlive);
  }
});

test('OpenAI transport requests JSON mode and reports API errors', async () => {
  let body;
  const transport = createOpenAITransport({
    apiKey: 'test-key',
    fetchImpl: async (_url, options) => {
      body = JSON.parse(options.body);
      return { ok: false, status: 429 };
    },
  });

  await assert.rejects(
    () => transport({ model: 'gpt-5-mini', prompt: 'Return JSON', jsonMode: true }),
    /OpenAI request failed with status 429/,
  );
  assert.deepStrictEqual(body.response_format, { type: 'json_object' });
});

test('OpenAI transport requires a server-side API key', () => {
  assert.throws(
    () => createOpenAITransport({ apiKey: '', fetchImpl: async () => ({}) }),
    /requires OPENAI_API_KEY/,
  );
});

test('GitHub transport reads repository data with a server-side token', async () => {
  let request;
  const transport = createGitHubTransport({
    token: 'test-token',
    endpoint: 'https://github.test',
    allowedRepositories: ['owner/repo'],
    fetchImpl: async (url, options) => {
      request = { url: String(url), options };
      return { ok: true, async json() { return { full_name: 'owner/repo' }; } };
    },
  });

  const result = await transport({ owner: 'owner', repo: 'repo', path: '/contents/src/index.js' });

  assert.equal(result.full_name, 'owner/repo');
  assert.equal(request.url, 'https://github.test/repos/owner/repo/contents/src/index.js');
  assert.equal(request.options.headers.authorization.startsWith('Bearer '), true);
});

test('GitHub transport rejects repositories outside its explicit allowlist', async () => {
  let requests = 0;
  const transport = createGitHubTransport({
    token: 'test-token',
    allowedRepositories: ['owner/approved'],
    fetchImpl: async () => {
      requests += 1;
      return { ok: true, async json() { return {}; } };
    },
  });

  await assert.rejects(
    () => transport({ owner: 'owner', repo: 'private' }),
    /repository is not allowlisted/,
  );
  assert.equal(requests, 0);
});

test('GitHub repository plugin exposes read-only actions through the runtime', async () => {
  const runtime = canonicalRuntime({
    modelTransport: async () => 'ok',
    permissions: [PERMISSIONS.GITHUB_READ],
    githubAllowedRepositories: ['owner/repo'],
    githubTransport: async ({ path }) => ({ path }),
  });

  const result = await runtime.pluginRegistry.execute('github', 'get-file', {
    owner: 'owner',
    repo: 'repo',
    path: 'README.md',
  });

  assert.deepStrictEqual(result, { path: '/contents/README.md' });
  assert.equal(runtime.pluginRegistry.isAvailable('github'), true);
});

test('GitHub repository plugin enforces its allowlist and bounded pagination', async () => {
  const runtime = canonicalRuntime({
    modelTransport: async () => 'ok',
    permissions: [PERMISSIONS.GITHUB_READ],
    githubAllowedRepositories: ['owner/repo'],
    githubTransport: async (request) => request,
  });

  await assert.rejects(
    () => runtime.pluginRegistry.execute('github', 'get-repository', { owner: 'owner', repo: 'other' }),
    /repository is not allowlisted/,
  );
  await assert.rejects(
    () => runtime.pluginRegistry.execute('github', 'search-code', {
      owner: 'owner',
      repo: 'repo',
      query: 'test',
      perPage: 101,
    }),
    /pagination requires/,
  );
  const result = await runtime.pluginRegistry.execute('github', 'search-code', {
    owner: 'owner',
    repo: 'repo',
    query: 'test',
    page: 2,
    perPage: 50,
  });
  assert.equal(result.query.page, 2);
  assert.equal(result.query.per_page, 50);
});

test('GitHub access is unavailable without the read permission', async () => {
  const runtime = createRuntime([]);

  await assert.rejects(
    () => runtime.pluginRegistry.execute('github', 'get-repository', { owner: 'owner', repo: 'repo' }),
    (error) => error.code === 'PLUGIN_UNAVAILABLE',
  );
});

test('TikTok actions require post permission and sensitive TikTok writes require owner approval', async () => {
  const noPermission = createRuntime([]);
  await assert.rejects(
    () => noPermission.pluginRegistry.execute('tiktok', 'publish-post', {}),
    (error) => error.code === 'PLUGIN_UNAVAILABLE',
  );

  const runtime = createRuntime([PERMISSIONS.POST_TIKTOK]);
  await assert.rejects(
    () => runtime.pluginRegistry.execute('tiktok', 'publish-post', {}),
    (error) => error.code === 'ACTION_APPROVAL_REQUIRED',
  );
});

test('comics plugin creates an approval-aware carousel brief through the canonical registry', async () => {
  const runtime = createRuntime();

  const result = await runtime.pluginRegistry.execute('comics', 'create-comic-brief', {
    variant: 'carousel',
    hook: 'Turn a product problem into a visual story',
    characterScene: 'A creator at a cluttered desk',
    coreMessage: 'The product simplifies the workflow',
    cta: 'Start your trial',
    caption: 'From friction to flow.',
    hashtags: ['#creative', '#workflow'],
    factualClaims: ['Saves users time'],
    publicFacing: true,
  });

  assert.equal(result.status, 'ready');
  assert.deepStrictEqual(result.comicBrief.panelRange, { min: 6, max: 10 });
  assert.equal(result.comicBrief.hook, 'Turn a product problem into a visual story');
  assert.deepStrictEqual(result.comicBrief.hashtags, ['#creative', '#workflow']);
  assert.equal(result.approvalRequired, true);
  assert.deepStrictEqual(result.approvalReasons, ['factual-claims', 'public-facing']);
});

test('comics plugin supports the short-form and promo-launch ranges without approval triggers', async () => {
  const runtime = createRuntime();

  const shortForm = await runtime.pluginRegistry.execute('comics', 'create-comic-brief', {
    variant: 'short-form-social',
  });
  const promoLaunch = await runtime.pluginRegistry.execute('comics', 'create-comic-brief', {
    variant: 'promo-launch',
  });

  assert.deepStrictEqual(shortForm.comicBrief.panelRange, { min: 3, max: 5 });
  assert.deepStrictEqual(promoLaunch.comicBrief.panelRange, { min: 3, max: 5 });
  assert.equal(shortForm.approvalRequired, false);
  assert.equal(promoLaunch.approvalRequired, false);
});

test('comics plugin remains unavailable without the required permission', async () => {
  const runtime = createRuntime([]);

  await assert.rejects(
    () => runtime.pluginRegistry.execute('comics', 'create-comic-brief', { variant: 'carousel' }),
    (error) => error.code === 'PLUGIN_UNAVAILABLE',
  );
});

test('assistant profiles retain separate histories and personality instructions', async () => {
  const prompts = [];
  const runtime = createRuntime([], {
    modelTransport: async ({ prompt, model }) => {
      prompts.push({ prompt, model });
      return `${model} reply`;
    },
    claudeTransport: async ({ prompt, model }) => {
      prompts.push({ prompt, model });
      return `${model} reply`;
    },
  });
  const profiles = runtime.assistantProfiles;

  profiles.updateInstructions('karma', 'Be concise and candid.');
  profiles.saveFeedback('karma', 'Lead with the answer.');
  profiles.saveExample(
    'collaborator',
    { prompt: 'Structure a plan', response: 'Start with the goal.' },
  );
  await profiles.chat('karma', 'Karma-only question');
  await profiles.chat('collaborator', 'Collaborator-only question');

  assert.equal(profiles.history('karma').length, 2);
  assert.equal(profiles.history('collaborator').length, 2);
  assert.equal(profiles.history('karma').some((entry) => entry.content.includes('Collaborator-only')), false);
  assert.match(prompts[0].prompt, /Be concise and candid/);
  assert.match(prompts[0].prompt, /Lead with the answer/);
  assert.doesNotMatch(prompts[0].prompt, /Structure a plan/);
  assert.match(prompts[1].prompt, /Structure a plan/);
  assert.equal(prompts[0].model, 'claude-sonnet-5');
  assert.equal(prompts[1].model, 'gpt-5');
});

test('approved business knowledge is shared with both profiles; proposals require review', async () => {
  const prompts = [];
  const runtime = createRuntime([], {
    sharedBusinessKnowledge: ['Approved from configuration'],
    modelTransport: async ({ prompt }) => {
      prompts.push(prompt);
      return 'response';
    },
    claudeTransport: async ({ prompt }) => {
      prompts.push(prompt);
      return 'response';
    },
  });
  const profiles = runtime.assistantProfiles;
  const proposal = profiles.proposeBusinessFact('Proposed fact');

  assert.deepEqual(profiles.sharedKnowledge(), ['Approved from configuration']);
  profiles.reviewBusinessFact(proposal, true);
  await profiles.chat('karma', 'Question');
  await profiles.chat('collaborator', 'Question');
  assert.deepEqual(profiles.sharedKnowledge(), ['Approved from configuration', 'Proposed fact']);
  assert.match(prompts[0], /Proposed fact/);
  assert.match(prompts[1], /Proposed fact/);
  assert.throws(
    () => profiles.reviewBusinessFact({ fact: 'Unsubmitted' }, true),
    /unreviewed business fact/,
  );
});

test('Together mode produces two labeled replies and at most one optional review', async () => {
  let calls = 0;
  const runtime = createRuntime([], {
    modelTransport: async ({ model }) => `${model} response ${++calls}`,
    claudeTransport: async ({ model }) => `${model} response ${++calls}`,
  });

  const replies = await runtime.assistantProfiles.chat('together', 'Compare these ideas');
  assert.equal(replies.length, 2);
  assert.deepEqual(replies.map(({ assistant }) => assistant), ['Karma', 'Collaborator']);
  const reviewed = await runtime.assistantProfiles.chat('together', 'Review once', { includeReview: true });
  assert.equal(reviewed.length, 3);
  assert.deepEqual(reviewed.map(({ assistant }) => assistant), [
    'Karma',
    'Collaborator',
    'Karma (review)',
  ]);
  assert.equal(calls, 5);
});

test('profile memories are isolated and saved shared facts only appear after Dan reviews them', () => {
  const runtime = createRuntime([]);
  const profiles = runtime.assistantProfiles;

  profiles.saveFeedback('karma', 'Keep answers short');
  profiles.saveExample('collaborator', { prompt: 'Plan', response: 'Steps' });

  const proposal = profiles.proposeBusinessFact('New sales territory');
  profiles.reviewBusinessFact(proposal, false);
  assert.deepEqual(profiles.sharedKnowledge(), []);
  assert.throws(
    () => profiles.reviewBusinessFact(proposal, true),
    /unreviewed business fact/,
  );
});

test('sensitive tool calls need exact, one-use Dan approval and cannot cross profiles', async () => {
  let executions = 0;
  const runtime = createRuntime(['commerce:spend'], {
    featureFlagOverrides: { commerceEnabled: true },
  });
  runtime.pluginRegistry.register({
    id: 'commerce',
    requiredFlag: 'commerceEnabled',
    requiredPermissions: ['commerce:spend'],
    async execute() {
      executions += 1;
      return 'completed';
    },
  });
  const profiles = runtime.assistantProfiles;
  const request = profiles.requestActionApproval('karma', 'commerce', 'spend', { amount: 10 });

  await assert.rejects(
    () => profiles.executeTool('karma', 'commerce', 'spend', { amount: 10 }),
    (error) => error.code === 'ACTION_APPROVAL_REQUIRED',
  );
  const untrustedRuntime = createRuntime([], { authorizeDanAction: () => false });
  const untrustedApproval = untrustedRuntime.assistantProfiles.requestActionApproval(
    'karma',
    'commerce',
    'spend',
    { amount: 10 },
  );
  assert.throws(
    () => untrustedRuntime.assistantProfiles.approveAction(untrustedApproval.id),
    /Only Dan can approve/,
  );
  profiles.approveAction(request.id);
  await assert.rejects(
    () => profiles.executeTool('collaborator', 'commerce', 'spend', {
      amount: 10,
      approvalId: request.id,
    }),
    (error) => error.code === 'ACTION_APPROVAL_REQUIRED',
  );
  assert.equal(
    await profiles.executeTool('karma', 'commerce', 'spend', { amount: 10, approvalId: request.id }),
    'completed',
  );
  await assert.rejects(
    () => profiles.executeTool('karma', 'commerce', 'spend', { amount: 10, approvalId: request.id }),
    (error) => error.code === 'ACTION_APPROVAL_REQUIRED',
  );
  assert.equal(executions, 1);
});

test('tool permissions are enforced even when the Collaborator requests the action', async () => {
  let executions = 0;
  const runtime = createRuntime([], {
    featureFlagOverrides: { commerceEnabled: true },
  });
  runtime.pluginRegistry.register({
    id: 'commerce',
    requiredFlag: 'commerceEnabled',
    requiredPermissions: ['commerce:spend'],
    async execute() {
      executions += 1;
    },
  });

  await assert.rejects(
    () => runtime.assistantProfiles.executeTool('collaborator', 'commerce', 'spend', {}),
    (error) => error.code === 'PLUGIN_UNAVAILABLE',
  );
  assert.equal(executions, 0);
  assert.equal(runtime.auditLogger.list().some((event) => event.type === 'plugin.blocked'), true);
});

test('profile edits and shared-fact review fail closed without Dan authentication', () => {
  const runtime = createRuntime([], { authorizeDanAction: () => false });
  const profiles = runtime.assistantProfiles;

  assert.throws(() => profiles.updateInstructions('karma', 'New instructions'), /Dan’s authenticated session/);
  assert.throws(() => profiles.saveFeedback('karma', 'Be concise'), /Dan’s authenticated session/);
  assert.throws(() => profiles.proposeBusinessFact('New fact'), /Dan’s authenticated session/);
});

test('publishing, deletion, and account changes each require their own approval', async () => {
  let executions = 0;
  const runtime = createRuntime([]);
  runtime.pluginRegistry.register({
    id: 'business-tools',
    async execute() {
      executions += 1;
    },
  });

  for (const action of ['publish-post', 'delete-data', 'change-account']) {
    await assert.rejects(
      () => runtime.assistantProfiles.executeTool('karma', 'business-tools', action, {}),
      (error) => error.code === 'ACTION_APPROVAL_REQUIRED',
    );
  }
  assert.equal(executions, 0);
});

test('write, spend, and admin operations all require owner approval', async () => {
  const runtime = createRuntime([]);
  runtime.pluginRegistry.register({
    id: 'provider',
    async execute() {},
  });

  for (const [action, context] of [
    ['update-product', {}],
    ['perform-operation', { operation: 'spend' }],
    ['manage-tenant', { operation: 'administer' }],
  ]) {
    await assert.rejects(
      () => runtime.assistantProfiles.executeTool('karma', 'provider', action, context),
      (error) => error.code === 'ACTION_APPROVAL_REQUIRED',
    );
  }
});

test('assistant HTTP API uses authenticated server identity for fact reviews and action approvals', async () => {
  let executions = 0;
  const runtime = createRuntime(['commerce:spend'], {
    authorizeDanAction: (_operation, identity) => identity?.id === 'dan-123',
    featureFlagOverrides: { commerceEnabled: true },
  });
  runtime.pluginRegistry.register({
    id: 'commerce',
    requiredFlag: 'commerceEnabled',
    requiredPermissions: ['commerce:spend'],
    async execute() {
      executions += 1;
      return 'completed';
    },
  });

  const handler = createAssistantHttpHandler({
    assistantProfiles: runtime.assistantProfiles,
    getAuthenticatedIdentity: (request) => request.auth?.user,
    danUserId: 'dan-123',
  });
  const call = async (path, { userId, body, method } = {}) => {
    const request = new Request(`https://karma.test${path}`, {
      method: method ?? (body === undefined ? 'GET' : 'POST'),
      headers: body === undefined ? {} : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (userId) Object.defineProperty(request, 'auth', { value: { user: { id: userId } } });
    return handler(request);
  };

  assert.equal((await call('/api/assistant/profiles')).status, 401);
  const chat = await call('/api/assistant/chat', {
    userId: 'dan-123',
    body: { mode: 'together', prompt: 'Two perspectives' },
  });
  assert.equal((await chat.json()).replies.length, 2);
  const karmaHistory = await call('/api/assistant/history?profile=karma', { userId: 'dan-123' });
  const collaboratorHistory = await call('/api/assistant/history?profile=collaborator', {
    userId: 'dan-123',
  });
  assert.match(JSON.stringify(await karmaHistory.json()), /Two perspectives/);
  assert.match(JSON.stringify(await collaboratorHistory.json()), /Two perspectives/);

  const spoofed = await call('/api/assistant/shared-facts', {
    userId: 'not-dan',
    body: { fact: 'Private claim', identity: { id: 'dan-123' } },
  });
  assert.equal(spoofed.status, 403);

  const proposed = await call('/api/assistant/shared-facts', {
    userId: 'dan-123',
    body: { fact: 'Approved territory' },
  });
  const { fact } = await proposed.json();
  assert.equal(fact.fact, 'Approved territory');
  assert.equal((await call('/api/assistant/shared-facts')).status, 401);
  assert.equal((await call('/api/assistant/shared-facts/review', {
    userId: 'dan-123',
    body: { id: fact.id, approved: true },
  })).status, 200);
  assert.equal((await call('/api/assistant/shared-facts/review', {
    userId: 'dan-123',
    body: { id: fact.id, approved: true },
  })).status, 400);
  const facts = await call('/api/assistant/shared-facts', { userId: 'dan-123' });
  assert.deepEqual((await facts.json()).approved, ['Approved territory']);

  const requested = await call('/api/assistant/approvals', {
    userId: 'dan-123',
    body: {
      profile: 'karma',
      pluginId: 'commerce',
      action: 'spend',
      context: { amount: 10, reason: 'review this', approvalId: 'ignored', assistantProfile: 'spoof' },
    },
  });
  const { approval } = await requested.json();
  assert.deepEqual((await (await call('/api/assistant/approvals', { userId: 'dan-123' })).json())
    .approvals[0].context, { amount: 10, reason: 'review this' });
  assert.equal((await (await call('/api/assistant/approvals', { userId: 'not-dan' })).json())
    .approvals.length, 0);
  assert.equal((await call('/api/assistant/approvals/approve', {
    userId: 'not-dan',
    body: { id: approval.id },
  })).status, 403);
  assert.equal((await call('/api/assistant/approvals/approve', {
    userId: 'dan-123',
    body: { id: approval.id, identity: { id: 'not-dan' } },
  })).status, 200);

  const execute = () => call('/api/assistant/tools', {
    userId: 'dan-123',
    body: {
      profile: 'karma',
      pluginId: 'commerce',
      action: 'spend',
      context: { amount: 10, reason: 'review this', approvalId: approval.id },
    },
  });
  assert.equal((await execute()).status, 200);
  assert.equal((await execute()).status, 403);
  assert.equal(executions, 1);
  assert.equal((await (await call('/api/assistant/approvals', { userId: 'dan-123' })).json())
    .approvals.length, 0);
});
