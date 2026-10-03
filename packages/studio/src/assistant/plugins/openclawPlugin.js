import { PERMISSIONS } from '../core/permissions.js';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin.js';

const OPENCLAW_SUPPORTED_ACTIONS = Object.freeze([
  'describe-capabilities',
  'get-standalone-app-config',
  'setup-agency-workspace',
  'setup-tiktok-dashboard',
  'create-evidence-register',
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

function getCreatorAllianceContext() {
  return {
    legalEntity: {
      name: 'Creator Alliance Networks Pty Ltd',
      jurisdiction: 'Australia',
      abn: '55 700 905 157',
      acn: '700 905 157',
    },
    officialDomain: 'https://creativealliancenetwork.com',
    separateProjects: [
      {
        name: 'Goated Guardians',
        relationship: 'separate internal/project name; not independently verified',
      },
    ],
    unverifiedAssociations: ['creatoralliance.org', 'Caribbean Creators Alliance'],
  };
}

function getAgencyWorkspacePlan(context = {}) {
  return {
    workspace: context.workspace || 'agency',
    areas: ['client-onboarding', 'content-operations', 'reporting', 'approvals'],
    recommendedIntegrations: ['openclaw', 'tiktok', 'canva', 'shopify', 'amazon'],
    organization: getCreatorAllianceContext(),
    documentationReady: true,
  };
}

function getTikTokDashboardPlan(context = {}) {
  return {
    dashboardId: context.dashboardId || 'tiktok-operations',
    sections: ['campaign-overview', 'content-calendar', 'engagement-signals', 'handoff-notes'],
    organization: getCreatorAllianceContext(),
    automationReady: true,
    documentationReady: true,
  };
}

function createEvidenceRegister(context = {}) {
  const entries = context.entries ?? [];
  if (!Array.isArray(entries)) {
    throw new Error('Evidence register entries must be an array');
  }

  return {
    subject: 'Creator Alliance Networks Pty Ltd',
    allowedSources: ['user-provided material', 'independently verifiable public sources'],
    assessmentLimit: 'This action records supplied information; it does not independently verify sources or claims.',
    entries: entries.map((entry) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        throw new Error('Each evidence register entry must be an object');
      }
      if (!['user-provided', 'public-source'].includes(entry.sourceType)) {
        throw new Error('Each evidence register entry must identify a user-provided or public source');
      }

      return {
        sourceType: entry.sourceType,
        date: entry.date || 'Not supplied',
        source: entry.source || 'Not supplied',
        fileOrScreenshotName: entry.fileOrScreenshotName || 'Not supplied',
        exactFactualClaim: entry.exactFactualClaim || 'Not supplied',
        whatEvidenceProves: entry.whatEvidenceProves || 'Not assessed',
        whatRemainsUnverified: entry.whatRemainsUnverified || 'Not assessed',
        tikTokStatementCompared: entry.tikTokStatementCompared || 'No prior TikTok statement supplied for comparison',
        contradictionWithTikTok: entry.contradictionWithTikTok || 'Not assessed',
        relevance: entry.relevance || 'Not assessed',
        verificationStatus: 'Not independently verified by this action',
      };
    }),
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
        case 'create-evidence-register':
          return {
            platform: 'openclaw',
            action,
            status: 'ready',
            register: createEvidenceRegister(context),
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
