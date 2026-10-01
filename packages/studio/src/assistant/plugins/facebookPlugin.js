import { PERMISSIONS } from '../core/permissions.js';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin.js';

const FACEBOOK_SUPPORTED_ACTIONS = Object.freeze([
  'describe-capabilities',
  'get-page-overview',
  'create-post',
  'schedule-post',
  'get-page-insights',
  'list-ad-accounts',
]);

function getPageOverview(context = {}) {
  return {
    page: context.page || 'default-facebook-page',
    sections: ['posts', 'insights', 'ad-accounts', 'messages'],
    businessSuiteReady: true,
    documentationReady: true,
  };
}

function createPost(context = {}) {
  return {
    page: context.page || 'default-facebook-page',
    message: context.message || null,
    created: Boolean(context.message),
    documentationReady: true,
  };
}

function schedulePost(context = {}) {
  return {
    page: context.page || 'default-facebook-page',
    message: context.message || null,
    scheduledFor: context.scheduledFor || null,
    scheduled: Boolean(context.message) && Boolean(context.scheduledFor),
    documentationReady: true,
  };
}

function getPageInsights(context = {}) {
  return {
    page: context.page || 'default-facebook-page',
    metrics: ['reach', 'engagement', 'page-views', 'follower-growth'],
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

export function createFacebookPlugin(deps) {
  return createScopedIntegrationPlugin({
    id: 'facebook',
    requiredPermissions: [PERMISSIONS.POST_FACEBOOK],
    ...deps,
    async actionHandler(action, context = {}) {
      switch (action) {
        case 'describe-capabilities':
          return {
            platform: 'facebook',
            supportedActions: FACEBOOK_SUPPORTED_ACTIONS,
            supportsBusinessSuite: true,
            documentationReady: true,
            status: 'ready',
          };
        case 'get-page-overview':
          return {
            platform: 'facebook',
            action,
            status: 'ready',
            overview: getPageOverview(context),
          };
        case 'create-post':
          return {
            platform: 'facebook',
            action,
            status: 'ready',
            result: createPost(context),
          };
        case 'schedule-post':
          return {
            platform: 'facebook',
            action,
            status: 'ready',
            result: schedulePost(context),
          };
        case 'get-page-insights':
          return {
            platform: 'facebook',
            action,
            status: 'ready',
            result: getPageInsights(context),
          };
        case 'list-ad-accounts':
          return {
            platform: 'facebook',
            action,
            status: 'ready',
            result: listAdAccounts(context),
          };
        default:
          return { platform: 'facebook', action, context, status: 'queued' };
      }
    },
  });
}
