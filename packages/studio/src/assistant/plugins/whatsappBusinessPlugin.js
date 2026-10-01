import { PERMISSIONS } from '../core/permissions.js';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin.js';

const WHATSAPP_BUSINESS_SUPPORTED_ACTIONS = Object.freeze([
  'describe-capabilities',
  'get-business-profile',
  'send-message',
  'list-message-templates',
  'get-conversation-insights',
]);

function getBusinessProfile(context = {}) {
  return {
    phoneNumberId: context.phoneNumberId || null,
    sections: ['profile', 'message-templates', 'conversations'],
    businessApiReady: true,
    documentationReady: true,
  };
}

function sendMessage(context = {}) {
  return {
    phoneNumberId: context.phoneNumberId || null,
    to: context.to || null,
    message: context.message || null,
    sent: Boolean(context.to) && Boolean(context.message),
    documentationReady: true,
  };
}

function listMessageTemplates(context = {}) {
  return {
    phoneNumberId: context.phoneNumberId || null,
    templates: [],
    documentationReady: true,
  };
}

function getConversationInsights(context = {}) {
  return {
    phoneNumberId: context.phoneNumberId || null,
    metrics: ['conversations', 'response-time', 'delivery-rate'],
    summaryAvailable: false,
    documentationReady: true,
  };
}

export function createWhatsappBusinessPlugin(deps) {
  return createScopedIntegrationPlugin({
    id: 'whatsapp-business',
    requiredPermissions: [PERMISSIONS.POST_WHATSAPP_BUSINESS],
    ...deps,
    async actionHandler(action, context = {}) {
      switch (action) {
        case 'describe-capabilities':
          return {
            platform: 'whatsapp-business',
            supportedActions: WHATSAPP_BUSINESS_SUPPORTED_ACTIONS,
            supportsBusinessApi: true,
            documentationReady: true,
            status: 'ready',
          };
        case 'get-business-profile':
          return {
            platform: 'whatsapp-business',
            action,
            status: 'ready',
            profile: getBusinessProfile(context),
          };
        case 'send-message':
          return {
            platform: 'whatsapp-business',
            action,
            status: 'ready',
            result: sendMessage(context),
          };
        case 'list-message-templates':
          return {
            platform: 'whatsapp-business',
            action,
            status: 'ready',
            result: listMessageTemplates(context),
          };
        case 'get-conversation-insights':
          return {
            platform: 'whatsapp-business',
            action,
            status: 'ready',
            result: getConversationInsights(context),
          };
        default:
          return { platform: 'whatsapp-business', action, context, status: 'queued' };
      }
    },
  });
}
