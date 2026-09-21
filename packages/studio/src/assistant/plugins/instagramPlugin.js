import { PERMISSIONS } from '../core/permissions.js';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin.js';

export function createInstagramPlugin(deps) {
  return createScopedIntegrationPlugin({
    id: 'instagram',
    requiredPermissions: [PERMISSIONS.POST_INSTAGRAM],
    ...deps,
    async actionHandler(action, context) {
      return { platform: 'instagram', action, context, status: 'queued' };
    },
  });
}

