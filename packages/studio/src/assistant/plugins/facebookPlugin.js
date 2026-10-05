import { PERMISSIONS } from '../core/permissions.js';
import { createScaffoldIntegrationPlugin } from './createScopedIntegrationPlugin.js';

export function createFacebookPlugin(deps) {
  const page = (context) => context.page || 'default-facebook-page';
  return createScaffoldIntegrationPlugin({
    ...deps,
    id: 'facebook',
    requiredPermissions: [PERMISSIONS.POST_FACEBOOK],
    capabilities: { supportsBusinessSuite: true },
    actions: {
      'get-page-overview': (context) => ({
        overview: {
          page: page(context),
          sections: ['posts', 'insights', 'ad-accounts', 'messages'],
          businessSuiteReady: false,
        },
      }),
      'create-post': (context) => ({
        result: { page: page(context), message: context.message || null, created: false },
      }),
      'schedule-post': (context) => ({
        result: {
          page: page(context),
          message: context.message || null,
          scheduledFor: context.scheduledFor || null,
          scheduled: false,
        },
      }),
      'get-page-insights': (context) => ({
        result: {
          page: page(context),
          metrics: ['reach', 'engagement', 'page-views', 'follower-growth'],
          summaryAvailable: false,
        },
      }),
      'list-ad-accounts': (context) => ({
        result: { businessId: context.businessId || null, adAccounts: [] },
      }),
    },
  });
}
