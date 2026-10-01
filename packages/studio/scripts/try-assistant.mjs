import { createAssistantRuntime } from '../src/assistant/index.js';

async function main() {
  const runtime = createAssistantRuntime({
    permissions: [
      'openclaw:manage',
      'microsoft-hub:read',
      'post:tiktok',
      'post:tiktok-business',
      'tiktok-ads:write',
      'post:facebook',
      'post:instagram',
      'post:whatsapp-business',
      'post:reddit',
      'meta-business:read',
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
  const shopifyCapabilities = await runtime.pluginRegistry.execute(
    'shopify',
    'describe-capabilities',
    { requestedBy: 'local-smoke-test' },
  );
  const shopifyOverview = await runtime.pluginRegistry.execute('shopify', 'get-store-overview', {
    requestedBy: 'local-smoke-test',
  });
  const amazonCapabilities = await runtime.pluginRegistry.execute(
    'amazon',
    'describe-capabilities',
    { requestedBy: 'local-smoke-test' },
  );
  const amazonOverview = await runtime.pluginRegistry.execute('amazon', 'get-store-overview', {
    requestedBy: 'local-smoke-test',
  });
  const metaBusinessOverview = await runtime.pluginRegistry.execute(
    'meta-business',
    'get-business-account-overview',
    { requestedBy: 'local-smoke-test' },
  );
  const whatsappProfile = await runtime.pluginRegistry.execute(
    'whatsapp-business',
    'get-business-profile',
    { requestedBy: 'local-smoke-test' },
  );
  const redditOverview = await runtime.pluginRegistry.execute(
    'reddit',
    'get-business-account-overview',
    { requestedBy: 'local-smoke-test' },
  );
  const tiktokPersonalOverview = await runtime.pluginRegistry.execute(
    'tiktok',
    'get-account-overview',
    { requestedBy: 'local-smoke-test' },
  );
  const tiktokBusinessOverview = await runtime.pluginRegistry.execute(
    'tiktok-business',
    'get-account-overview',
    { requestedBy: 'local-smoke-test' },
  );
  const tiktokAdsOverview = await runtime.pluginRegistry.execute(
    'tiktok-ads',
    'get-ads-account-overview',
    { requestedBy: 'local-smoke-test' },
  );

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
  console.log(
    'Shopify supported actions:',
    JSON.stringify(shopifyCapabilities.supportedActions, null, 2),
  );
  console.log('Shopify store overview:', JSON.stringify(shopifyOverview.overview, null, 2));
  console.log(
    'Amazon supported actions:',
    JSON.stringify(amazonCapabilities.supportedActions, null, 2),
  );
  console.log('Amazon store overview:', JSON.stringify(amazonOverview.overview, null, 2));
  console.log('Meta Business overview:', JSON.stringify(metaBusinessOverview.overview, null, 2));
  console.log('WhatsApp Business profile:', JSON.stringify(whatsappProfile.profile, null, 2));
  console.log('Reddit business overview:', JSON.stringify(redditOverview.overview, null, 2));
  console.log('TikTok personal overview:', JSON.stringify(tiktokPersonalOverview.overview, null, 2));
  console.log('TikTok business overview:', JSON.stringify(tiktokBusinessOverview.overview, null, 2));
  console.log('TikTok ads overview:', JSON.stringify(tiktokAdsOverview.overview, null, 2));
}

main().catch((error) => {
  console.error('Try run failed:', error);
  process.exitCode = 1;
});
