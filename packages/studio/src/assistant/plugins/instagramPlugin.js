import { PERMISSIONS } from '../core/permissions.js';
import { createScaffoldIntegrationPlugin } from './createScopedIntegrationPlugin.js';

export function createInstagramPlugin(deps) {
  const account = (context) => context.account || 'default-instagram-business-account';
  return createScaffoldIntegrationPlugin({
    ...deps,
    id: 'instagram',
    requiredPermissions: [PERMISSIONS.POST_INSTAGRAM],
    capabilities: { supportsBusinessSuite: true },
    actions: {
      'get-business-profile-overview': (context) => ({
        overview: {
          account: account(context),
          sections: ['posts', 'stories', 'insights', 'ad-accounts'],
          businessSuiteReady: false,
        },
      }),
      'create-post': (context) => ({
        result: { account: account(context), caption: context.caption || null, created: false },
      }),
      'schedule-post': (context) => ({
        result: {
          account: account(context),
          caption: context.caption || null,
          scheduledFor: context.scheduledFor || null,
          scheduled: false,
        },
      }),
      'get-media-insights': (context) => ({
        result: {
          account: account(context),
          metrics: ['reach', 'impressions', 'engagement', 'follower-growth'],
          summaryAvailable: false,
        },
      }),
      'list-ad-accounts': (context) => ({
        result: { businessId: context.businessId || null, adAccounts: [] },
      }),
    },
  });
}
