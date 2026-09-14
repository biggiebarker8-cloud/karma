import { createFeatureFlags } from './core/featureFlags';
import { createPluginRegistry } from './core/pluginRegistry';
import { createRateLimiter } from './core/rateLimiter';
import { createAuditLogger } from './core/auditLogger';
import { hasPermission } from './core/permissions';
import { createModelGateway } from './model/modelGateway';
import { createHearingAdapter } from './voice/hearingAdapter';
import { createVoiceAdapter } from './voice/voiceAdapter';
import { createTurnController } from './voice/turnControls';
import { createMemoryStore } from './memory/memoryStore';
import { applyToneProfile } from './tone/toneEngine';
import { createContinuousLearningStore } from './learning/continuousLearning';
import { createInternetReferenceRetriever } from './references/internetReferenceRetriever';
import { getAccessibilityProfile } from './accessibility/accessibilityProfiles';
import { createVisionAdapter } from './vision/visionAdapter';
import { createDesktopInstallAdvisor } from './install/desktopInstallAdvisor';
import { createOpenclawPlugin } from './plugins/openclawPlugin';
import { createTikTokPlugin } from './plugins/tiktokPlugin';
import { createFacebookPlugin } from './plugins/facebookPlugin';
import { createInstagramPlugin } from './plugins/instagramPlugin';
import { createShopifyPlugin } from './plugins/shopifyPlugin';
import { createAmazonPlugin } from './plugins/amazonPlugin';
import { createCanvaPlugin } from './plugins/canvaPlugin';
import { createHoodieDesignPlugin } from './plugins/hoodieDesignPlugin';
import { createComicsPlugin } from './plugins/comicsPlugin';
import { createMovieClipsPlugin } from './plugins/movieClipsPlugin';
import { createInstallExperiencePlugin } from './plugins/installExperiencePlugin';

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
