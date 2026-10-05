import assert from 'node:assert/strict';
import { createAssistantRuntime } from '../src/assistant/index.js';

const integrationActions = {
  tiktok: ['get-account-overview', 'create-post', 'get-video-insights'],
  'tiktok-business': ['get-account-overview', 'create-post', 'get-account-insights'],
  'tiktok-ads': ['get-ads-account-overview', 'create-campaign', 'get-campaign-insights'],
  facebook: ['get-page-overview', 'create-post', 'schedule-post', 'get-page-insights', 'list-ad-accounts'],
  instagram: ['get-business-profile-overview', 'create-post', 'schedule-post', 'get-media-insights', 'list-ad-accounts'],
  'whatsapp-business': ['get-business-profile', 'send-message', 'list-message-templates', 'get-conversation-insights'],
  reddit: ['get-business-account-overview', 'create-post', 'get-subreddit-insights', 'list-ads-campaigns'],
  shopify: ['get-store-overview', 'list-orders', 'get-inventory-levels', 'update-inventory', 'create-discount', 'sync-product-listing'],
  amazon: ['get-store-overview', 'list-orders', 'get-inventory-levels', 'update-listing-price', 'create-promotion', 'check-account-health'],
  'meta-business': ['get-business-account-overview', 'list-connected-platforms'],
};

const populatedContext = {
  account: 'smoke-account',
  page: 'smoke-page',
  advertiserId: 'smoke-advertiser',
  campaignId: 'smoke-campaign',
  campaignName: 'Smoke campaign',
  budget: 100,
  businessId: 'smoke-business',
  phoneNumberId: 'smoke-phone',
  to: 'smoke-recipient',
  caption: 'Smoke caption',
  message: 'Smoke message',
  scheduledFor: '2027-01-01T12:00:00Z',
  subreddit: 'smoke-subreddit',
  title: 'Smoke title',
  store: 'smoke-store',
  status: 'unfulfilled',
  limit: 10,
  locationId: 'smoke-location',
  fulfillmentChannel: 'FBM',
  skus: ['smoke-sku'],
  sku: 'smoke-sku',
  quantity: 5,
  code: 'SMOKE',
  percentageOff: 10,
  productId: 'smoke-product',
  price: 20,
  promotionId: 'smoke-promotion',
  connectedPlatforms: ['facebook', 'instagram', 'whatsapp-business'],
  executed: true,
  requiresConnection: false,
  created: true,
  sent: true,
  granted: true,
  permissions: ['post:tiktok', '', null, 'shopify:write'],
  workspace: 'smoke-workspace',
  dashboardId: 'smoke-dashboard',
  target: 'smoke-target',
  grantedBy: 'smoke-requester',
};

const outcomeFlags = new Set([
  'created', 'sent', 'synced', 'applied', 'scheduled', 'automationReady',
  'businessSuiteReady', 'businessApiReady', 'businessAccountReady', 'granted',
]);

function assertNoExternalSuccess(value) {
  for (const [key, child] of Object.entries(value)) {
    // Fallback context is echoed request data, not an execution outcome.
    if (key === 'context') continue;
    if (outcomeFlags.has(key)) assert.equal(child, false, `${key} must not report success`);
    if (child && typeof child === 'object') assertNoExternalSuccess(child);
  }
}

function assertStub(result) {
  assert.equal(result.status, 'stubbed');
  assert.equal(result.executed, false);
  assert.equal(result.requiresConnection, true);
  assertNoExternalSuccess(result);
  for (const key of ['result', 'overview', 'profile', 'workspace', 'dashboard', 'permissionGrant']) {
    if (!result[key]) continue;
    assert.equal(result[key].executed, false, `${key} must not be executed`);
    assert.equal(result[key].requiresConnection, true, `${key} must require connection`);
  }
}

async function assertBlocked(runtime, pluginId, action, reason) {
  await assert.rejects(
    runtime.pluginRegistry.execute(pluginId, action, populatedContext),
    (error) => error.code === 'PLUGIN_UNAVAILABLE' && error.details.some((detail) => detail.includes(reason)),
  );
}

async function main() {
  const runtime = createAssistantRuntime({
    permissions: [
      'openclaw:manage',
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

  const plugins = runtime.pluginRegistry.list();
  const permissions = plugins.flatMap((candidate) => candidate.requiredPermissions || []);
  const disabled = createAssistantRuntime({
    permissions,
    modelTransport: async () => 'ok',
    featureFlagOverrides: { pluginsEnabled: false, openclawEnabled: false },
  });
  let checkedActions = 0;
  for (const [pluginId, actions] of Object.entries(integrationActions)) {
    const integration = plugins.find((candidate) => candidate.id === pluginId);
    assert.ok(integration, `${pluginId} must be registered`);
    assert.ok(integration.requiredPermissions.every((permission) => typeof permission === 'string'));
    const missingPermission = createAssistantRuntime({
      permissions: permissions.filter((permission) => !integration.requiredPermissions.includes(permission)),
      modelTransport: async () => 'ok',
    });
    for (const context of [{}, populatedContext]) {
      const capabilities = await runtime.pluginRegistry.execute(pluginId, 'describe-capabilities', context);
      assert.deepEqual(capabilities.supportedActions, ['describe-capabilities', ...actions]);
      for (const action of [...capabilities.supportedActions, 'unknown-write-action', 'constructor']) {
        const output = await runtime.pluginRegistry.execute(pluginId, action, context);
        assertStub(output);
        assert.equal(output.platform, pluginId);
        if (action === 'unknown-write-action' || action === 'constructor') {
          assert.deepEqual(output.context, context);
        }
        if (action === 'list-orders') {
          assert.equal(output.result.status, context.status || 'any');
          assert.equal(output.result.limit, context.limit || 25);
        }
        if (pluginId === 'meta-business' && action === 'get-business-account-overview') {
          assert.deepEqual(output.overview.connectedPlatforms, []);
          assert.deepEqual(output.overview.supportedPlatforms, ['facebook', 'instagram', 'whatsapp-business']);
        }
        if (pluginId === 'meta-business' && action === 'list-connected-platforms') {
          assert.deepEqual(output.result.platforms, []);
          assert.deepEqual(
            output.result.supportedPlatforms.map((platform) => platform.platform),
            ['facebook', 'instagram', 'whatsapp-business'],
          );
          for (const platform of output.result.supportedPlatforms) {
            assert.equal(platform.pluginId, platform.platform);
            assert.equal(platform.requiredPermission, `post:${platform.platform}`);
          }
        }
        for (const nested of [output.result, output.overview, output.profile]) {
          if (!nested) continue;
          for (const [key, value] of Object.entries(nested)) {
            if (key in context && !outcomeFlags.has(key) && !['executed', 'requiresConnection', 'connectedPlatforms'].includes(key)) {
              assert.deepEqual(value, context[key], `${pluginId}/${action} preserves ${key}`);
            }
          }
        }
        checkedActions += 1;
      }
    }
    for (const action of ['describe-capabilities', ...actions, 'unknown-write-action']) {
      await assertBlocked(missingPermission, pluginId, action, 'missing permissions:');
      await assertBlocked(disabled, pluginId, action, 'feature flag "pluginsEnabled" is disabled');
    }
  }

  assert.deepEqual(result.supportedActions, [
    'describe-capabilities', 'get-standalone-app-config', 'setup-agency-workspace',
    'setup-tiktok-dashboard', 'grant-ai-solutions-permissions', 'document-larks-handoff',
  ]);
  const withoutOpenclawPermission = createAssistantRuntime({
    permissions: permissions.filter((permission) => permission !== 'openclaw:manage'),
    modelTransport: async () => 'ok',
  });
  for (const context of [{}, populatedContext]) {
    for (const action of result.supportedActions) {
      const output = await runtime.pluginRegistry.execute('openclaw', action, context);
      assertNoExternalSuccess(output);
      if (['setup-agency-workspace', 'setup-tiktok-dashboard', 'grant-ai-solutions-permissions'].includes(action)) {
        assertStub(output);
      } else {
        assert.equal(output.executed, false);
        assert.equal(output.documentationReady ?? output.config?.documentationReady ?? output.handoff?.documentationReady, true);
      }
      if (action === 'setup-tiktok-dashboard') {
        assert.equal(output.dashboard.automationReady, false);
        assert.equal(output.dashboard.dashboardId, context.dashboardId || 'tiktok-operations');
      }
      if (action === 'grant-ai-solutions-permissions') {
        assert.equal(output.permissionGrant.granted, false);
        assert.deepEqual(output.permissionGrant.grantedPermissions, []);
        assert.deepEqual(
          output.permissionGrant.requestedPermissions,
          context.permissions ? ['post:tiktok', 'shopify:write'] : [],
        );
      }
      await assertBlocked(withoutOpenclawPermission, 'openclaw', action, 'missing permissions:');
      await assertBlocked(disabled, 'openclaw', action, 'feature flag "openclawEnabled" is disabled');
    }
  }

  console.log('Assistant runtime is runnable.');
  console.log(`Verified ${checkedActions} scaffold responses across ten integrations, permission/flag gates, and Openclaw plans.`);
  console.log(`Plugin: ${plugin.id}`);
  console.log(`Action: ${actionId}`);
  console.log('Result:', JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error('Try run failed:', error);
  process.exitCode = 1;
});
