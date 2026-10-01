import { PERMISSIONS } from '../core/permissions.js';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin.js';

const REDDIT_SUPPORTED_ACTIONS = Object.freeze([
  'describe-capabilities',
  'get-business-account-overview',
  'create-post',
  'get-subreddit-insights',
  'list-ads-campaigns',
]);

function getBusinessAccountOverview(context = {}) {
  return {
    account: context.account || 'default-reddit-business-account',
    sections: ['posts', 'subreddit-insights', 'ads-campaigns'],
    businessAccountReady: true,
    documentationReady: true,
  };
}

function createPost(context = {}) {
  return {
    account: context.account || 'default-reddit-business-account',
    subreddit: context.subreddit || null,
    title: context.title || null,
    created: Boolean(context.subreddit) && Boolean(context.title),
    documentationReady: true,
  };
}

function getSubredditInsights(context = {}) {
  return {
    subreddit: context.subreddit || null,
    metrics: ['upvote-rate', 'comment-rate', 'reach'],
    summaryAvailable: false,
    documentationReady: true,
  };
}

function listAdsCampaigns(context = {}) {
  return {
    account: context.account || 'default-reddit-business-account',
    campaigns: [],
    documentationReady: true,
  };
}

export function createRedditPlugin(deps) {
  return createScopedIntegrationPlugin({
    id: 'reddit',
    requiredPermissions: [PERMISSIONS.POST_REDDIT],
    ...deps,
    async actionHandler(action, context = {}) {
      switch (action) {
        case 'describe-capabilities':
          return {
            platform: 'reddit',
            supportedActions: REDDIT_SUPPORTED_ACTIONS,
            supportsBusinessAccount: true,
            documentationReady: true,
            status: 'ready',
          };
        case 'get-business-account-overview':
          return {
            platform: 'reddit',
            action,
            status: 'ready',
            overview: getBusinessAccountOverview(context),
          };
        case 'create-post':
          return {
            platform: 'reddit',
            action,
            status: 'ready',
            result: createPost(context),
          };
        case 'get-subreddit-insights':
          return {
            platform: 'reddit',
            action,
            status: 'ready',
            result: getSubredditInsights(context),
          };
        case 'list-ads-campaigns':
          return {
            platform: 'reddit',
            action,
            status: 'ready',
            result: listAdsCampaigns(context),
          };
        default:
          return { platform: 'reddit', action, context, status: 'queued' };
      }
    },
  });
}
