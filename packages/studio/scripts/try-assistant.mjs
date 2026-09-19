import { createAssistantRuntime } from '../src/assistant/index.js';

async function main() {
  const runtime = createAssistantRuntime({
    permissions: [
      'openclaw:manage',
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

  const plugin = runtime.pluginRegistry.list().find((candidate) => candidate.id === 'alliance-bot');
  if (!plugin) {
    throw new Error('Alliance Bot plugin is not registered in the assistant runtime');
  }

  const actionId = 'ai-solutions-consulting';
  const result = await runtime.pluginRegistry.execute('alliance-bot', actionId, {
    requestedBy: 'local-smoke-test',
  });
  const blocked = await runtime.pluginRegistry.execute('alliance-bot', actionId, {
    requestedBy: 'local-smoke-test',
    requestedAction: 'change admin role',
  });

  if (result.status !== 'ready') {
    throw new Error('Alliance Bot standard action did not execute');
  }
  if (
    blocked.status !== 'not-permitted' ||
    blocked.code !== 'ALLIANCE_ACTION_NOT_PERMITTED' ||
    blocked.canGuide !== true ||
    blocked.canExecute !== false
  ) {
    throw new Error('Alliance Bot restricted-action contract is invalid');
  }

  console.log('Alliance Bot runtime is runnable.');
  console.log(`Plugin: ${plugin.id}`);
  console.log(`Action: ${actionId}`);
  console.log('Standard result:', JSON.stringify(result, null, 2));
  console.log('Restricted result:', JSON.stringify(blocked, null, 2));
}

main().catch((error) => {
  console.error('Try run failed:', error);
  process.exitCode = 1;
});
