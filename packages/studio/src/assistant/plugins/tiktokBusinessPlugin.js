import { PERMISSIONS } from '../core/permissions.js';
import { createScaffoldIntegrationPlugin } from './createScopedIntegrationPlugin.js';

export function createTikTokBusinessPlugin(deps) {
  const account = (context) => context.account || 'default-tiktok-business-account';
  return createScaffoldIntegrationPlugin({
    ...deps,
    id: 'tiktok-business',
    requiredPermissions: [PERMISSIONS.POST_TIKTOK_BUSINESS],
    capabilities: { accountType: 'business' },
    actions: {
      'get-account-overview': (context) => ({
        overview: {
          account: account(context),
          sections: ['posts', 'account-insights', 'catalog'],
          accountType: 'business',
        },
      }),
      'create-post': (context) => ({
        result: { account: account(context), caption: context.caption || null, created: false },
      }),
      'get-account-insights': (context) => ({
        result: {
          account: account(context),
          metrics: ['video-views', 'profile-views', 'follower-growth', 'engagement-rate'],
          summaryAvailable: false,
        },
      }),
    },
  });
}
