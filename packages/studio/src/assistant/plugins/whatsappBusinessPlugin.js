import { PERMISSIONS } from '../core/permissions.js';
import { createScaffoldIntegrationPlugin } from './createScopedIntegrationPlugin.js';

export function createWhatsappBusinessPlugin(deps) {
  return createScaffoldIntegrationPlugin({
    ...deps,
    id: 'whatsapp-business',
    requiredPermissions: [PERMISSIONS.POST_WHATSAPP_BUSINESS],
    capabilities: { supportsBusinessApi: true },
    actions: {
      'get-business-profile': (context) => ({
        profile: {
          phoneNumberId: context.phoneNumberId || null,
          sections: ['profile', 'message-templates', 'conversations'],
          businessApiReady: false,
        },
      }),
      'send-message': (context) => ({
        result: {
          phoneNumberId: context.phoneNumberId || null,
          to: context.to || null,
          message: context.message || null,
          sent: false,
        },
      }),
      'list-message-templates': (context) => ({
        result: { phoneNumberId: context.phoneNumberId || null, templates: [] },
      }),
      'get-conversation-insights': (context) => ({
        result: {
          phoneNumberId: context.phoneNumberId || null,
          metrics: ['conversations', 'response-time', 'delivery-rate'],
          summaryAvailable: false,
        },
      }),
    },
  });
}
