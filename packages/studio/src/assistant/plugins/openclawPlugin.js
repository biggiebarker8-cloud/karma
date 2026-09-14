import { PERMISSIONS } from '../core/permissions';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin';

export function createOpenclawPlugin(deps) {
  return createScopedIntegrationPlugin({
    id: 'openclaw',
    requiredFlag: 'openclawEnabled',
    requiredPermissions: [PERMISSIONS.OPENCLAW_MANAGE],
    ...deps,
    async actionHandler(action, context) {
      return {
        platform: 'openclaw',
        action,
        context,
        documentationReady: true,
        status: 'queued',
      };
    },
  });
}
