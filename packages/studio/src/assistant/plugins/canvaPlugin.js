import { PERMISSIONS } from '../core/permissions.js';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin.js';

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

