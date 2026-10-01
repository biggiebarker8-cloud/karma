import assert from 'node:assert/strict';
import test from 'node:test';

import { createAssistantRuntime as canonicalRuntime } from '../src/assistant/index.js';
import { createAssistantRuntime as compatibilityRuntime } from '../src/assistant/index.mjs';
import { PERMISSIONS } from '../src/assistant/core/permissions.js';
import { createModelGateway } from '../src/assistant/model/modelGateway.js';
import { createOpenAITransport } from '../src/assistant/model/openaiTransport.js';
import { createClaudeTransport } from '../src/assistant/model/claudeTransport.js';

function createRuntime(permissions = [PERMISSIONS.DESIGN_COMICS]) {
  return canonicalRuntime({
    modelTransport: async () => 'ok',
    permissions,
    featureFlagOverrides: {
      pluginsEnabled: true,
      creativePluginsEnabled: true,
    },
  });
}

test('compatibility entrypoint exports the canonical runtime factory', () => {
  assert.strictEqual(compatibilityRuntime, canonicalRuntime);
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

test('OpenAI and Claude transports use compatible request formats', async () => {
  let openAIRequest;
  let claudeRequest;
  const openAI = createOpenAITransport({
    apiKey: 'openai-test-key',
    fetchImpl: async (url, options) => {
      openAIRequest = { url, options };
      return { ok: true, async json() {
        return { choices: [{ message: { content: 'openai response' } }] };
      } };
    },
  });
  const claude = createClaudeTransport({
    apiKey: 'claude-test-key',
    fetchImpl: async (url, options) => {
      claudeRequest = { url, options };
      return { ok: true, async json() {
        return { content: [{ text: 'claude response' }] };
      } };
    },
  });

  assert.equal(await openAI({ model: 'gpt-5', prompt: 'Hello' }), 'openai response');
  assert.equal(await claude({ model: 'claude-sonnet-5', prompt: 'Hello' }), 'claude response');
  assert.equal(JSON.parse(openAIRequest.options.body).messages[0].role, 'user');
  assert.equal(JSON.parse(claudeRequest.options.body).messages[0].role, 'user');
  assert.equal(claudeRequest.options.headers['x-api-key'], 'claude-test-key');
});

test('Claude requests fail clearly without a Claude transport', async () => {
  const gateway = createModelGateway({ transport: async () => 'openai response' });

  await assert.rejects(
    () => gateway.complete({ model: 'claude-haiku-4.5', prompt: 'Hello' }),
    /require a Claude transport/,
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
