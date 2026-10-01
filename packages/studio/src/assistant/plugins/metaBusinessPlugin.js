import { PERMISSIONS } from '../core/permissions.js';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin.js';

const META_BUSINESS_SUPPORTED_ACTIONS = Object.freeze([
  'describe-capabilities',
  'get-business-account-overview',
  'list-connected-platforms',
]);

function getBusinessAccountOverview(context = {}) {
  return {
    businessId: context.businessId || 'default-meta-business-account',
    connectedPlatforms: ['facebook', 'instagram', 'whatsapp-business'],
    sections: ['pages', 'ad-accounts', 'whatsapp-numbers', 'catalog'],
    businessSuiteReady: true,
    documentationReady: true,
  };
}

function listConnectedPlatforms(context = {}) {
  return {
    businessId: context.businessId || 'default-meta-business-account',
    platforms: [
      { platform: 'facebook', pluginId: 'facebook', requiredPermission: PERMISSIONS.POST_FACEBOOK },
      { platform: 'instagram', pluginId: 'instagram', requiredPermission: PERMISSIONS.POST_INSTAGRAM },
      {
        platform: 'whatsapp-business',
        pluginId: 'whatsapp-business',
        requiredPermission: PERMISSIONS.POST_WHATSAPP_BUSINESS,
      },
    ],
    documentationReady: true,
  };
}

export function createMetaBusinessPlugin(deps) {
  return createScopedIntegrationPlugin({
    id: 'meta-business',
    requiredPermissions: [PERMISSIONS.META_BUSINESS_READ],
    ...deps,
    async actionHandler(action, context = {}) {
      switch (action) {
        case 'describe-capabilities':
          return {
            platform: 'meta-business',
            supportedActions: META_BUSINESS_SUPPORTED_ACTIONS,
            supportsFacebook: true,
            supportsInstagram: true,
            supportsWhatsappBusiness: true,
            documentationReady: true,
            status: 'ready',
          };
        case 'get-business-account-overview':
          return {
            platform: 'meta-business',
            action,
            status: 'ready',
            overview: getBusinessAccountOverview(context),
          };
        case 'list-connected-platforms':
          return {
            platform: 'meta-business',
            action,
            status: 'ready',
            result: listConnectedPlatforms(context),
          };
        default:
          return { platform: 'meta-business', action, context, status: 'queued' };
      }
    },
  });
}
