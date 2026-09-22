import assert from 'node:assert/strict';
import test from 'node:test';

import { createAssistantRuntime as canonicalRuntime } from '../src/assistant/index.js';
import { createAssistantRuntime as compatibilityRuntime } from '../src/assistant/index.mjs';
import { PERMISSIONS } from '../src/assistant/core/permissions.js';

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
