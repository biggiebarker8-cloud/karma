import { PERMISSIONS } from '../core/permissions.js';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin.js';

const INSTAGRAM_SUPPORTED_ACTIONS = Object.freeze([
  'describe-capabilities',
  'get-business-profile-overview',
  'create-post',
  'schedule-post',
  'get-media-insights',
  'list-ad-accounts',
]);

function getBusinessProfileOverview(context = {}) {
  return {
    account: context.account || 'default-instagram-business-account',
    sections: ['posts', 'stories', 'insights', 'ad-accounts'],
    businessSuiteReady: true,
    documentationReady: true,
  };
}

function createPost(context = {}) {
  return {
    account: context.account || 'default-instagram-business-account',
    caption: context.caption || null,
    created: Boolean(context.caption),
    documentationReady: true,
  };
}

function schedulePost(context = {}) {
  return {
    account: context.account || 'default-instagram-business-account',
    caption: context.caption || null,
    scheduledFor: context.scheduledFor || null,
    scheduled: Boolean(context.caption) && Boolean(context.scheduledFor),
    documentationReady: true,
  };
}

function getMediaInsights(context = {}) {
  return {
    account: context.account || 'default-instagram-business-account',
    metrics: ['reach', 'impressions', 'engagement', 'follower-growth'],
    summaryAvailable: false,
    documentationReady: true,
  };
}

function listAdAccounts(context = {}) {
  return {
    businessId: context.businessId || null,
    adAccounts: [],
    documentationReady: true,
  };
}

export function createInstagramPlugin(deps) {
  return createScopedIntegrationPlugin({
    id: 'instagram',
    requiredPermissions: [PERMISSIONS.POST_INSTAGRAM],
    ...deps,
    async actionHandler(action, context = {}) {
      switch (action) {
        case 'describe-capabilities':
          return {
            platform: 'instagram',
            supportedActions: INSTAGRAM_SUPPORTED_ACTIONS,
            supportsBusinessSuite: true,
            documentationReady: true,
            status: 'ready',
          };
        case 'get-business-profile-overview':
          return {
            platform: 'instagram',
            action,
            status: 'ready',
            overview: getBusinessProfileOverview(context),
          };
        case 'create-post':
          return {
            platform: 'instagram',
            action,
            status: 'ready',
            result: createPost(context),
          };
        case 'schedule-post':
          return {
            platform: 'instagram',
            action,
            status: 'ready',
            result: schedulePost(context),
          };
        case 'get-media-insights':
          return {
            platform: 'instagram',
            action,
            status: 'ready',
            result: getMediaInsights(context),
          };
        case 'list-ad-accounts':
          return {
            platform: 'instagram',
            action,
            status: 'ready',
            result: listAdAccounts(context),
          };
        default:
          return { platform: 'instagram', action, context, status: 'queued' };
      }
    },
  });
}
