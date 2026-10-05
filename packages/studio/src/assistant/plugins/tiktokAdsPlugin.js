import { PERMISSIONS } from '../core/permissions.js';
import { createScaffoldIntegrationPlugin } from './createScopedIntegrationPlugin.js';

export function createTikTokAdsPlugin(deps) {
  const advertiserId = (context) => context.advertiserId || 'default-tiktok-ads-account';
  return createScaffoldIntegrationPlugin({
    ...deps,
    id: 'tiktok-ads',
    requiredPermissions: [PERMISSIONS.TIKTOK_ADS_WRITE],
    capabilities: { accountType: 'ads' },
    actions: {
      'get-ads-account-overview': (context) => ({
        overview: {
          advertiserId: advertiserId(context),
          sections: ['campaigns', 'ad-groups', 'insights', 'billing'],
          accountType: 'ads',
        },
      }),
      'create-campaign': (context) => ({
        result: {
          advertiserId: advertiserId(context),
          campaignName: context.campaignName || null,
          budget: typeof context.budget === 'number' ? context.budget : null,
          created: false,
        },
      }),
      'get-campaign-insights': (context) => ({
        result: {
          advertiserId: advertiserId(context),
          campaignId: context.campaignId || null,
          metrics: ['impressions', 'clicks', 'conversions', 'spend'],
          summaryAvailable: false,
        },
      }),
    },
  });
}
