import { PERMISSIONS } from '../core/permissions.js';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin.js';

const TIKTOK_BUSINESS_SUPPORTED_ACTIONS = Object.freeze([
  'describe-capabilities',
  'get-account-overview',
  'create-post',
  'get-account-insights',
]);

function getAccountOverview(context = {}) {
  return {
    account: context.account || 'default-tiktok-business-account',
    sections: ['posts', 'account-insights', 'catalog'],
    accountType: 'business',
    documentationReady: true,
  };
}

function createPost(context = {}) {
  return {
    account: context.account || 'default-tiktok-business-account',
    caption: context.caption || null,
    created: Boolean(context.caption),
    documentationReady: true,
  };
}

function getAccountInsights(context = {}) {
  return {
    account: context.account || 'default-tiktok-business-account',
    metrics: ['video-views', 'profile-views', 'follower-growth', 'engagement-rate'],
    summaryAvailable: false,
    documentationReady: true,
  };
}

export function createTikTokBusinessPlugin(deps) {
  return createScopedIntegrationPlugin({
    id: 'tiktok-business',
    requiredPermissions: [PERMISSIONS.POST_TIKTOK_BUSINESS],
    ...deps,
    async actionHandler(action, context = {}) {
      switch (action) {
        case 'describe-capabilities':
          return {
            platform: 'tiktok-business',
            accountType: 'business',
            supportedActions: TIKTOK_BUSINESS_SUPPORTED_ACTIONS,
            documentationReady: true,
            status: 'ready',
          };
        case 'get-account-overview':
          return {
            platform: 'tiktok-business',
            action,
            status: 'ready',
            overview: getAccountOverview(context),
          };
        case 'create-post':
          return {
            platform: 'tiktok-business',
            action,
            status: 'ready',
            result: createPost(context),
          };
        case 'get-account-insights':
          return {
            platform: 'tiktok-business',
            action,
            status: 'ready',
            result: getAccountInsights(context),
          };
        default:
          return { platform: 'tiktok-business', action, context, status: 'queued' };
      }
    },
  });
}
