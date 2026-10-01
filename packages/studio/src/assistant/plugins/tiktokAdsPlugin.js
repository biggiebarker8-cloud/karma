import { PERMISSIONS } from '../core/permissions.js';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin.js';

const TIKTOK_ADS_SUPPORTED_ACTIONS = Object.freeze([
  'describe-capabilities',
  'get-ads-account-overview',
  'create-campaign',
  'get-campaign-insights',
]);

function getAdsAccountOverview(context = {}) {
  return {
    advertiserId: context.advertiserId || 'default-tiktok-ads-account',
    sections: ['campaigns', 'ad-groups', 'insights', 'billing'],
    accountType: 'ads',
    documentationReady: true,
  };
}

function createCampaign(context = {}) {
  return {
    advertiserId: context.advertiserId || 'default-tiktok-ads-account',
    campaignName: context.campaignName || null,
    budget: typeof context.budget === 'number' ? context.budget : null,
    created: Boolean(context.campaignName) && typeof context.budget === 'number',
    documentationReady: true,
  };
}

function getCampaignInsights(context = {}) {
  return {
    advertiserId: context.advertiserId || 'default-tiktok-ads-account',
    campaignId: context.campaignId || null,
    metrics: ['impressions', 'clicks', 'conversions', 'spend'],
    summaryAvailable: false,
    documentationReady: true,
  };
}

export function createTikTokAdsPlugin(deps) {
  return createScopedIntegrationPlugin({
    id: 'tiktok-ads',
    requiredPermissions: [PERMISSIONS.TIKTOK_ADS_WRITE],
    ...deps,
    async actionHandler(action, context = {}) {
      switch (action) {
        case 'describe-capabilities':
          return {
            platform: 'tiktok-ads',
            accountType: 'ads',
            supportedActions: TIKTOK_ADS_SUPPORTED_ACTIONS,
            documentationReady: true,
            status: 'ready',
          };
        case 'get-ads-account-overview':
          return {
            platform: 'tiktok-ads',
            action,
            status: 'ready',
            overview: getAdsAccountOverview(context),
          };
        case 'create-campaign':
          return {
            platform: 'tiktok-ads',
            action,
            status: 'ready',
            result: createCampaign(context),
          };
        case 'get-campaign-insights':
          return {
            platform: 'tiktok-ads',
            action,
            status: 'ready',
            result: getCampaignInsights(context),
          };
        default:
          return { platform: 'tiktok-ads', action, context, status: 'queued' };
      }
    },
  });
}
