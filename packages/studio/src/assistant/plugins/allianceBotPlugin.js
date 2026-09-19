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

function buildAllianceResponse(action, context = {}) {
  return {
    actionId: action.id,
    summary: action.description,
    requestedBy: context.requestedBy ?? 'alliance-bot-user',
    status: 'ready',
  };
}

export function createAllianceBotPlugin() {
  return {
    id: 'alliance-bot',
    name: 'Alliance Bot',
    description:
      'Cross-channel AI solutions consultant for TikTok, Meta, Claude, Amazon, Instagram, Shopify, Wix, Openclaw, Larks, Azure, and Manus workflows.',
    actions: allianceActions.map(({ id, title, description }) => ({
      id,
      title,
      description,
    })),
    async execute(actionId, context) {
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
