import { PERMISSIONS } from '../core/permissions';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin';

export function createAmazonPlugin(deps) {
  return createScopedIntegrationPlugin({
    id: 'amazon',
    requiredPermissions: [PERMISSIONS.AMAZON_WRITE],
    ...deps,
    async actionHandler(action, context) {
      return { platform: 'amazon', action, context, status: 'queued' };
    },
  });
}

