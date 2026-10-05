import { PERMISSIONS } from '../core/permissions.js';
import { createScaffoldIntegrationPlugin } from './createScopedIntegrationPlugin.js';

export function createMetaBusinessPlugin(deps) {
  const businessId = (context) => context.businessId || 'default-meta-business-account';
  return createScaffoldIntegrationPlugin({
    ...deps,
    id: 'meta-business',
    requiredPermissions: [PERMISSIONS.META_BUSINESS_READ],
    capabilities: {
      supportsFacebook: true,
      supportsInstagram: true,
      supportsWhatsappBusiness: true,
    },
    actions: {
      'get-business-account-overview': (context) => ({
        overview: {
          businessId: businessId(context),
          connectedPlatforms: [],
          supportedPlatforms: ['facebook', 'instagram', 'whatsapp-business'],
          sections: ['pages', 'ad-accounts', 'whatsapp-numbers', 'catalog'],
          businessSuiteReady: false,
        },
      }),
      'list-connected-platforms': (context) => ({
        result: {
          businessId: businessId(context),
          platforms: [],
          supportedPlatforms: [
            { platform: 'facebook', pluginId: 'facebook', requiredPermission: PERMISSIONS.POST_FACEBOOK },
            { platform: 'instagram', pluginId: 'instagram', requiredPermission: PERMISSIONS.POST_INSTAGRAM },
            {
              platform: 'whatsapp-business',
              pluginId: 'whatsapp-business',
              requiredPermission: PERMISSIONS.POST_WHATSAPP_BUSINESS,
            },
          ],
        },
      }),
    },
  });
}
