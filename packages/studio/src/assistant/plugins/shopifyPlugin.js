import { PERMISSIONS } from '../core/permissions.js';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin.js';

export function createShopifyPlugin(deps) {
  return createScopedIntegrationPlugin({
    id: 'shopify',
    requiredPermissions: [PERMISSIONS.SHOPIFY_WRITE],
    ...deps,
    async actionHandler(action, context) {
      return { platform: 'shopify', action, context, status: 'queued' };
    },
  });
}

