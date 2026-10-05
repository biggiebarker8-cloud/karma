import { PERMISSIONS } from '../core/permissions.js';
import { createScaffoldIntegrationPlugin } from './createScopedIntegrationPlugin.js';

export function createRedditPlugin(deps) {
  const account = (context) => context.account || 'default-reddit-business-account';
  return createScaffoldIntegrationPlugin({
    ...deps,
    id: 'reddit',
    requiredPermissions: [PERMISSIONS.POST_REDDIT],
    capabilities: { supportsBusinessAccount: true },
    actions: {
      'get-business-account-overview': (context) => ({
        overview: {
          account: account(context),
          sections: ['posts', 'subreddit-insights', 'ads-campaigns'],
          businessAccountReady: false,
        },
      }),
      'create-post': (context) => ({
        result: {
          account: account(context),
          subreddit: context.subreddit || null,
          title: context.title || null,
          created: false,
        },
      }),
      'get-subreddit-insights': (context) => ({
        result: {
          subreddit: context.subreddit || null,
          metrics: ['upvote-rate', 'comment-rate', 'reach'],
          summaryAvailable: false,
        },
      }),
      'list-ads-campaigns': (context) => ({
        result: { account: account(context), campaigns: [] },
      }),
    },
  });
}
