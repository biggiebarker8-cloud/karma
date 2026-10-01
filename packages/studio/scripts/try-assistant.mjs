import { createAssistantRuntime } from '../src/assistant/index.js';
import assert from 'node:assert/strict';

async function main() {
  const testDeps = { modelTransport: async () => 'ok' };
  const disabledApple = createAssistantRuntime({
    ...testDeps,
    permissions: ['apple:sign-in', 'apple:cloud-connect'],
  });
  assert.equal(disabledApple.pluginRegistry.isAvailable('apple-sign-in'), false);

  const unauthorizedApple = createAssistantRuntime({
    ...testDeps,
    featureFlagOverrides: { appleEnabled: true },
  });
  assert.equal(unauthorizedApple.pluginRegistry.isAvailable('apple-cloud'), false);

  const unconfiguredApple = createAssistantRuntime({
    ...testDeps,
    permissions: ['apple:sign-in', 'apple:cloud-connect'],
    featureFlagOverrides: { appleEnabled: true },
  });
  await assert.rejects(
    unconfiguredApple.pluginRegistry.execute('apple-sign-in', 'sign-in'),
    /provider is not configured/,
  );
  await assert.rejects(
    unconfiguredApple.pluginRegistry.execute('apple-cloud', 'connect'),
    /provider is not configured/,
  );

  let authenticated = false;
  const apple = createAssistantRuntime({
    ...testDeps,
    permissions: ['apple:sign-in', 'apple:cloud-connect'],
    featureFlagOverrides: { appleEnabled: true },
    appleAuth: {
      async signIn() {
        authenticated = true;
        return { id: 'apple-user', email: 'user@example.test', identityToken: 'not-exposed' };
      },
      async getSession() {
        return authenticated ? { userId: 'apple-user' } : null;
      },
      async signOut() {
        authenticated = false;
      },
    },
    appleCloud: {
      async connect(session) {
        assert.equal(session.userId, 'apple-user');
        return { connected: true, token: 'not-exposed' };
      },
      async getStatus() {
        return { connected: true };
      },
      async disconnect() {
        return { connected: false };
      },
      async sync(session) {
        assert.equal(session.userId, 'apple-user');
        return { connected: true, synced: true };
      },
    },
  });
  await assert.rejects(
    apple.pluginRegistry.execute('apple-cloud', 'connect', { userId: 'apple-user' }),
    /requires an authenticated session/,
  );
  assert.deepEqual(await apple.pluginRegistry.execute('apple-sign-in', 'sign-in'), {
    user: { id: 'apple-user', email: 'user@example.test' },
  });
  assert.deepEqual(await apple.pluginRegistry.execute('apple-cloud', 'connect'), {
    connected: true,
  });
  assert.deepEqual(await apple.pluginRegistry.execute('apple-cloud', 'get-status'), {
    connected: true,
  });
  assert.deepEqual(await apple.pluginRegistry.execute('apple-cloud', 'sync'), {
    connected: true,
    synced: true,
  });
  assert.deepEqual(await apple.pluginRegistry.execute('apple-cloud', 'disconnect'), {
    connected: false,
  });
  await apple.pluginRegistry.execute('apple-sign-in', 'sign-out');
  await assert.rejects(
    apple.pluginRegistry.execute('apple-cloud', 'get-status'),
    /requires an authenticated session/,
  );

  const runtime = createAssistantRuntime({
    permissions: [
      'openclaw:manage',
      'microsoft-hub:read',
      'post:tiktok',
      'post:facebook',
      'post:instagram',
      'shopify:write',
      'amazon:write',
      'canva:write',
      'design:hoodie',
      'design:comics',
      'edit:movie-clips',
      'install-guide:read',
      'internet:read',
      'memory:write',
      'voice:input',
      'voice:output',
      'image:read',
    ],
    featureFlagOverrides: {
      pluginsEnabled: true,
      openclawEnabled: true,
      microsoftHubEnabled: true,
      creativePluginsEnabled: true,
      installExperienceEnabled: true,
      internetReferencesEnabled: true,
      voiceInputEnabled: true,
      voiceOutputEnabled: true,
      visionEnabled: true,
      memoryEnabled: true,
      continuousLearningEnabled: true,
    },
    modelTransport: async () => 'ok',
    speechToText: async () => 'stub transcript',
    textToSpeech: async () => new Uint8Array(),
    imageAnalyzer: async () => ({ labels: [] }),
    fetchReferences: async () => [],
    installLinks: {
      windows: 'https://example.com/windows',
      macos: 'https://example.com/macos',
      android: 'https://example.com/android',
      ios: 'https://example.com/ios',
    },
  });

  const plugin = runtime.pluginRegistry.list().find((candidate) => candidate.id === 'openclaw');
  if (!plugin) {
    throw new Error('Openclaw plugin is not registered in the assistant runtime');
  }

  const actionId = 'describe-capabilities';
  const result = await runtime.pluginRegistry.execute('openclaw', actionId, {
    requestedBy: 'local-smoke-test',
  });
  const microsoftHubPages = await runtime.pluginRegistry.execute('microsoft-hub', 'list-pages', {
    requestedBy: 'local-smoke-test',
  });
  const cloudPage = await runtime.pluginRegistry.execute('microsoft-hub', 'get-page', {
    requestedBy: 'local-smoke-test',
    pageId: 'cloud',
  });
  const copilotsPage = await runtime.pluginRegistry.execute('microsoft-hub', 'get-page', {
    requestedBy: 'local-smoke-test',
    pageId: 'copilots',
  });
  const contactPage = await runtime.pluginRegistry.execute('microsoft-hub', 'get-page', {
    requestedBy: 'local-smoke-test',
    pageId: 'contact',
  });
  const developerPage = await runtime.pluginRegistry.execute('microsoft-hub', 'get-page', {
    requestedBy: 'local-smoke-test',
    pageId: 'visual-suite',
  });

  console.log('Assistant runtime is runnable.');
  console.log(`Plugin: ${plugin.id}`);
  console.log(`Action: ${actionId}`);
  console.log('Result:', JSON.stringify(result, null, 2));
  console.log(
    'Microsoft Hub Pages:',
    JSON.stringify(microsoftHubPages.pages.map((page) => page.id), null, 2),
  );
  console.log('Microsoft Cloud Page:', cloudPage.page.title, cloudPage.page.cards.length);
  console.log('Microsoft Copilots Page:', copilotsPage.page.title, copilotsPage.page.cards.length);
  console.log('Microsoft Contact Page:', contactPage.page.title, contactPage.page.cards.length);
  console.log('Microsoft Visual Suite Page:', developerPage.page.title, developerPage.page.cards.length);
}

main().catch((error) => {
  console.error('Try run failed:', error);
  process.exitCode = 1;
});
