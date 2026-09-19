const allianceActions = [
  {
    id: 'tiktok-growth-playbook',
    title: 'TikTok growth playbook',
    description: 'Create a content, ads, and optimization plan for TikTok.',
  },
  {
    id: 'facebook-meta-campaign-setup',
    title: 'Facebook/Meta campaign setup',
    description: 'Define campaign structure, targeting, and measurement for Meta properties.',
  },
  {
    id: 'claude-solution-design',
    title: 'Claude solution design',
    description: 'Plan Claude-powered workflows, prompts, and guardrails.',
  },
  {
    id: 'amazon-marketplace-strategy',
    title: 'Amazon marketplace strategy',
    description: 'Recommend catalog, ads, and funnel strategy for Amazon growth.',
  },
  {
    id: 'instagram-content-system',
    title: 'Instagram content system',
    description: 'Build an Instagram content and engagement operating model.',
  },
  {
    id: 'shopify-conversion-architecture',
    title: 'Shopify conversion architecture',
    description: 'Design Shopify storefront and conversion optimization priorities.',
  },
  {
    id: 'wix-site-implementation',
    title: 'Wix site implementation',
    description: 'Outline Wix site build structure and deployment checklist.',
  },
  {
    id: 'openclaw-workspace-setup',
    title: 'Openclaw workspace setup',
    description: 'Prepare Openclaw workspace onboarding and operating flow.',
  },
  {
    id: 'larks-handoff-plan',
    title: 'Larks handoff plan',
    description: 'Produce implementation handoff for Larks and partner teams.',
  },
  {
    id: 'azure-platform-rollout',
    title: 'Azure platform rollout',
    description: 'Define Azure architecture, security controls, and rollout phases.',
  },
  {
    id: 'manus-automation-blueprint',
    title: 'Manus automation blueprint',
    description: 'Plan automation opportunities and operating procedures for Manus.',
  },
  {
    id: 'ai-solutions-consulting',
    title: 'AI solutions consulting',
    description: 'Deliver end-to-end AI strategy, prioritization, and execution guidance.',
  },
];

const STANDARD_ACTION_ALLOWLIST = new Set(allianceActions.map((action) => action.id));

const BLOCKED_ACTION_GROUPS = Object.freeze([
  {
    id: 'payment-billing',
    label: 'payment/billing',
    reason: 'Payment and billing operations require an authorized human admin.',
    patterns: [/\bpayment\b/i, /\bbilling\b/i, /\binvoice\b/i, /\bcharge\b/i, /\brefund\b/i],
  },
  {
    id: 'admin-privilege-change',
    label: 'admin-role/ownership/privilege-change',
    reason: 'Admin role, ownership, and privilege changes require an authorized human admin.',
    patterns: [
      /\badmin\b/i,
      /\bowner(ship)?\b/i,
      /\bprivilege\b/i,
      /\bpermission\b/i,
      /\brole\b/i,
      /\baccess\b/i,
    ],
  },
]);

function getRequestedBy(context = {}) {
  return context.requestedBy ?? 'alliance-bot-user';
}

function resolveDeniedGroup(actionId, context = {}) {
  const candidates = [
    actionId,
    context.requestedAction,
    context.operation,
    context.intent,
    context.request,
  ].filter((value) => typeof value === 'string' && value.trim());

  return BLOCKED_ACTION_GROUPS.find((group) =>
    candidates.some((candidate) => group.patterns.some((pattern) => pattern.test(candidate))),
  );
}

function buildAllianceResponse(action, context = {}) {
  return {
    actionId: action.id,
    summary: action.description,
    requestedBy: getRequestedBy(context),
    status: 'ready',
    operator: {
      id: 'solutions-consultant',
      role: 'primary-operator',
    },
    accessPolicy: {
      execution: 'standard-actions-only',
      canGuideRestrictedActions: true,
      restrictedGroups: BLOCKED_ACTION_GROUPS.map((group) => group.label),
    },
  };
}

function buildDeniedResponse(actionId, context = {}, deniedGroup) {
  const requestedBy = getRequestedBy(context);
  const requestedAction = context.requestedAction || context.operation || context.intent || actionId;

  return {
    actionId,
    requestedAction,
    requestedBy,
    status: 'not-permitted',
    code: 'ALLIANCE_ACTION_NOT_PERMITTED',
    message: `Not permitted: Solutions Consultant cannot execute ${deniedGroup.label} actions.`,
    reason: deniedGroup.reason,
    canGuide: true,
    canExecute: false,
    handoff: {
      requiredRole: 'authorized human admin',
      instructions: [
        'Share the requested action with an authorized human admin for execution.',
        'Include business justification, affected account/workspace, and urgency.',
        'Request confirmation once the admin completes the operation.',
      ],
    },
  };
}

export function createAllianceBotPlugin({ auditLogger } = {}) {
  return {
    id: 'alliance-bot',
    name: 'Solutions Consultant',
    description:
      'Primary AI operator for standard cross-channel workflows with restricted execution for payment/billing and admin privilege changes.',
    actions: allianceActions.map(({ id, title, description }) => ({
      id,
      title,
      description,
    })),
    async execute(actionId, context = {}) {
      const deniedGroup = resolveDeniedGroup(actionId, context);
      if (deniedGroup) {
        const requestedBy = getRequestedBy(context);
        const requestedAction = context.requestedAction || context.operation || context.intent || actionId;

        auditLogger?.log?.({
          type: 'alliance.action_denied',
          actor: requestedBy,
          actionId,
          requestedAction,
          deniedGroup: deniedGroup.id,
          reason: deniedGroup.reason,
        });

        return buildDeniedResponse(actionId, context, deniedGroup);
      }

      if (!STANDARD_ACTION_ALLOWLIST.has(actionId)) {
        auditLogger?.log?.({
          type: 'alliance.action_denied',
          actor: getRequestedBy(context),
          actionId,
          requestedAction: actionId,
          deniedGroup: 'not-allowlisted',
          reason: 'Only allowlisted standard actions can be executed.',
        });

        const error = new Error(`Unknown Alliance Bot action: "${actionId}"`);
        error.code = 'ALLIANCE_ACTION_NOT_FOUND';
        throw error;
      }

      const action = allianceActions.find((candidate) => candidate.id === actionId);
      if (!action) {
        const error = new Error(`Unknown Alliance Bot action: "${actionId}"`);
        error.code = 'ALLIANCE_ACTION_NOT_FOUND';
        throw error;
      }

      return buildAllianceResponse(action, context);
    },
  };
}
