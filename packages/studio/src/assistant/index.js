import { createFeatureFlags } from './core/featureFlags.js';
import { createPluginRegistry } from './core/pluginRegistry.js';
import { createRateLimiter } from './core/rateLimiter.js';
import { createAuditLogger } from './core/auditLogger.js';
import { hasPermission } from './core/permissions.js';
import { createModelGateway } from './model/modelGateway.js';
import { createHearingAdapter } from './voice/hearingAdapter.js';
import { createVoiceAdapter } from './voice/voiceAdapter.js';
import { createTurnController } from './voice/turnControls.js';
import { createMemoryStore } from './memory/memoryStore.js';
import { applyToneProfile } from './tone/toneEngine.js';
import { createContinuousLearningStore } from './learning/continuousLearning.js';
import { createInternetReferenceRetriever } from './references/internetReferenceRetriever.js';
import { getAccessibilityProfile } from './accessibility/accessibilityProfiles.js';
import { createVisionAdapter } from './vision/visionAdapter.js';
import { createDesktopInstallAdvisor } from './install/desktopInstallAdvisor.js';
import { createOpenclawPlugin } from './plugins/openclawPlugin.js';
import { createTikTokPlugin } from './plugins/tiktokPlugin.js';
import { createFacebookPlugin } from './plugins/facebookPlugin.js';
import { createInstagramPlugin } from './plugins/instagramPlugin.js';
import { createShopifyPlugin } from './plugins/shopifyPlugin.js';
import { createAmazonPlugin } from './plugins/amazonPlugin.js';
import { createCanvaPlugin } from './plugins/canvaPlugin.js';
import { createHoodieDesignPlugin } from './plugins/hoodieDesignPlugin.js';
import { createComicsPlugin } from './plugins/comicsPlugin.js';
import { createMovieClipsPlugin } from './plugins/movieClipsPlugin.js';
import { createInstallExperiencePlugin } from './plugins/installExperiencePlugin.js';

export function createAssistantRuntime({
  featureFlagOverrides = {},
  permissions = [],
  modelTransport,
  speechToText,
  textToSpeech,
  imageAnalyzer,
  fetchReferences,
  allowlistDomains = [],
  installLinks = {},
}) {
  const auditLogger = createAuditLogger();
  const featureFlags = createFeatureFlags(featureFlagOverrides);
  const permissionChecker = (permission) => hasPermission(permissions, permission);
  const rateLimiter = createRateLimiter();

  const pluginRegistry = createPluginRegistry({
    featureFlags,
    grantedPermissions: permissions,
    auditLogger,
  });

  const installAdvisor = createDesktopInstallAdvisor({
    appName: 'Karma',
    installLinks,
    auditLogger,
  });

  const pluginDeps = { rateLimiter, auditLogger };
  [
    createOpenclawPlugin(pluginDeps),
    createTikTokPlugin(pluginDeps),
    createFacebookPlugin(pluginDeps),
    createInstagramPlugin(pluginDeps),
    createShopifyPlugin(pluginDeps),
    createAmazonPlugin(pluginDeps),
    createCanvaPlugin(pluginDeps),
    createHoodieDesignPlugin(pluginDeps),
    createComicsPlugin(pluginDeps),
    createMovieClipsPlugin(pluginDeps),
    createInstallExperiencePlugin({
      ...pluginDeps,
      installAdvisor,
    }),
  ].forEach((plugin) => pluginRegistry.register(plugin));

  const modelGateway = createModelGateway({
    transport: modelTransport,
    auditLogger,
  });

  const hearingAdapter = createHearingAdapter({
    speechToText,
    permissionChecker,
    auditLogger,
  });

  const voiceAdapter = createVoiceAdapter({
    textToSpeech,
    permissionChecker,
    auditLogger,
  });

  const visionAdapter = createVisionAdapter({
    imageAnalyzer,
    permissionChecker,
    auditLogger,
  });

  const turnController = createTurnController();
  const memoryStore = createMemoryStore({ auditLogger });
  const learningStore = createContinuousLearningStore({ auditLogger });
  const references = createInternetReferenceRetriever({
    fetchReferences,
    permissionChecker,
    allowlistDomains,
    requireCitation: true,
    auditLogger,
  });

  return {
    featureFlags,
    pluginRegistry,
    modelGateway,
    hearingAdapter,
    voiceAdapter,
    visionAdapter,
    turnController,
    memoryStore,
    learningStore,
    references,
    installAdvisor,
    getDesktopInstallOptions(context = {}) {
      return installAdvisor.getInstallOptions(context);
    },
    applyTone(text, profile) {
      return applyToneProfile(text, profile);
    },
    getAccessibilitySettings(profile) {
      return getAccessibilityProfile(profile);
    },
    auditLogger,
  };
}
