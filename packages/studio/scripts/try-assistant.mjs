import { createAssistantRuntime } from '../src/assistant/index.js';

function getRequiredPlugin(runtime, pluginId, label) {
  const plugin = runtime.pluginRegistry.list().find((candidate) => candidate.id === pluginId);
  if (!plugin) {
    throw new Error(`${label} plugin is not registered in the assistant runtime`);
  }
  return plugin;
}

async function main() {
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

  const plugin = getRequiredPlugin(runtime, 'openclaw', 'Openclaw');
  const microsoftHubPlugin = getRequiredPlugin(runtime, 'microsoft-hub', 'Microsoft Hub');

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
    pageId: 'developer',
  });

  console.log('Assistant runtime is runnable.');
  console.log(`Plugin: ${plugin.id}`);
  console.log(`Microsoft Hub Plugin: ${microsoftHubPlugin.id}`);
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
