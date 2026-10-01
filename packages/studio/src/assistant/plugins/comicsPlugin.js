import { PERMISSIONS } from '../core/permissions.js';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin.js';

const DEFAULT_VARIANT = 'short-form-social';

const COMIC_VARIANTS = Object.freeze({
  'short-form-social': Object.freeze({
    panelRange: Object.freeze({ min: 3, max: 5 }),
    narrative: 'product pain point to solution arc',
  }),
  carousel: Object.freeze({
    panelRange: Object.freeze({ min: 6, max: 10 }),
    narrative: 'problem, escalation, transformation, offer, and call to action',
  }),
  'promo-launch': Object.freeze({
    panelRange: Object.freeze({ min: 3, max: 5 }),
    narrative: 'character-led product reveal with offer framing and urgency',
  }),
});

const COMIC_GUARDRAILS = Object.freeze([
  'Keep factual claims verifiable.',
  'Require approval before publishing public-facing content.',
  'Review brand tone before finalizing output.',
]);

function toText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function toTextList(value) {
  return Array.isArray(value) ? value.map(toText).filter(Boolean) : [];
}

function getVariant(variant) {
  return Object.hasOwn(COMIC_VARIANTS, variant) ? variant : DEFAULT_VARIANT;
}

function createComicBrief(context = {}) {
  const variant = getVariant(context.variant);
  const plan = COMIC_VARIANTS[variant];
  const factualClaims = toTextList(context.factualClaims);
  const approvalReasons = [
    ...(factualClaims.length ? ['factual-claims'] : []),
    ...(context.publicFacing === true ? ['public-facing'] : []),
    ...(context.brandSensitive === true ? ['brand-sensitive'] : []),
  ];

  return {
    domain: 'storytelling',
    type: 'comics',
    status: 'ready',
    comicBrief: {
      variant,
      panelRange: { ...plan.panelRange },
      narrative: plan.narrative,
      hook: toText(context.hook),
      characterScene: toText(context.characterScene),
      coreMessage: toText(context.coreMessage),
      cta: toText(context.cta),
      caption: toText(context.caption),
      hashtags: toTextList(context.hashtags),
      factualClaims,
    },
    approvalRequired: approvalReasons.length > 0,
    approvalReasons,
    guardrails: [...COMIC_GUARDRAILS],
  };
}

export function createComicsPlugin(deps) {
  return createScopedIntegrationPlugin({
    id: 'comics',
    requiredFlag: 'creativePluginsEnabled',
    requiredPermissions: [PERMISSIONS.DESIGN_COMICS],
    ...deps,
    async actionHandler(action, context) {
      if (action === 'create-comic-brief') {
        return createComicBrief(context);
      }

      return {
        domain: 'storytelling',
        type: 'comics',
        action,
        context,
        status: 'queued',
      };
    },
  });
}
