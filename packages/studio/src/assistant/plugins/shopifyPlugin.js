import { PERMISSIONS } from '../core/permissions';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin';

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

