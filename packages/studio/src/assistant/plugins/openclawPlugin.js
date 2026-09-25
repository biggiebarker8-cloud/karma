import { PERMISSIONS } from '../core/permissions.js';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin.js';

const OPENCLAW_SUPPORTED_ACTIONS = Object.freeze([
  'describe-capabilities',
  'get-standalone-app-config',
  'setup-agency-workspace',
  'setup-tiktok-dashboard',
  'grant-ai-solutions-permissions',
  'document-larks-handoff',
]);

function normalizePermissionList(permissions) {
  if (!Array.isArray(permissions)) {
    return [];
  }

  return permissions.filter((permission) => typeof permission === 'string' && permission.trim());
}

function getStandaloneAppConfig(context = {}) {
  return {
    appId: context.appId || 'openclaw',
    mode: 'standalone',
    separatedFrom: ['larks', 'assistant-runtime-defaults'],
    modules: ['agency-ops', 'tiktok-dashboards', 'documentation', 'permissions'],
    documentationReady: true,
  };
}

function getAgencyWorkspacePlan(context = {}) {
  return {
    workspace: context.workspace || 'agency',
    areas: ['client-onboarding', 'content-operations', 'reporting', 'approvals'],
    recommendedIntegrations: ['openclaw', 'tiktok', 'canva', 'shopify', 'amazon'],
    documentationReady: true,
  };
}

function getTikTokDashboardPlan(context = {}) {
  return {
    dashboardId: context.dashboardId || 'tiktok-operations',
    sections: ['campaign-overview', 'content-calendar', 'engagement-signals', 'handoff-notes'],
    automationReady: true,
    documentationReady: true,
  };
}

function grantAiSolutionsPermissions(context = {}) {
  const grantedPermissions = normalizePermissionList(context.permissions);

  return {
    target: context.target || 'ai-solutions-constant',
    grantedBy: context.grantedBy || 'openclaw',
    grantedPermissions,
    granted: grantedPermissions.length > 0,
    documentationReady: true,
  };
}

function getLarksHandoff(context = {}) {
  return {
    handoffTarget: context.handoffTarget || 'larks',
    includeOpenclawSeparation: true,
    includeAgencyRunbook: true,
    includeTikTokDashboardNotes: true,
    documentationReady: true,
  };
}

export function createOpenclawPlugin(deps) {
  return createScopedIntegrationPlugin({
    id: 'openclaw',
    requiredFlag: 'openclawEnabled',
    requiredPermissions: [PERMISSIONS.OPENCLAW_MANAGE],
    ...deps,
    async actionHandler(action, context = {}) {
      switch (action) {
        case 'describe-capabilities':
          return {
            platform: 'openclaw',
            mode: 'standalone',
            supportedActions: OPENCLAW_SUPPORTED_ACTIONS,
            supportsAgencyOperations: true,
            supportsTikTokDashboards: true,
            documentationReady: true,
            status: 'ready',
          };
        case 'get-standalone-app-config':
          return {
            platform: 'openclaw',
            action,
            status: 'ready',
            config: getStandaloneAppConfig(context),
          };
        case 'setup-agency-workspace':
          return {
            platform: 'openclaw',
            action,
            status: 'ready',
            workspace: getAgencyWorkspacePlan(context),
          };
        case 'setup-tiktok-dashboard':
          return {
            platform: 'openclaw',
            action,
            status: 'ready',
            dashboard: getTikTokDashboardPlan(context),
          };
        case 'grant-ai-solutions-permissions':
          return {
            platform: 'openclaw',
            action,
            status: 'ready',
            permissionGrant: grantAiSolutionsPermissions(context),
          };
        case 'document-larks-handoff':
          return {
            platform: 'openclaw',
            action,
            status: 'ready',
            handoff: getLarksHandoff(context),
          };
        default:
          throw new Error(`Unsupported openclaw action: ${action}`);
      }
    },
  });
}
