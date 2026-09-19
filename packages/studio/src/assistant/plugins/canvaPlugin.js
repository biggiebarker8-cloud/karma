import { PERMISSIONS } from '../core/permissions';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin';

export function createCanvaPlugin(deps) {
  return createScopedIntegrationPlugin({
    id: 'canva',
    requiredPermissions: [PERMISSIONS.CANVA_WRITE],
    ...deps,
    async actionHandler(action, context) {
      return { platform: 'canva', action, context, status: 'queued' };
    },
  });
}

