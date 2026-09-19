import { PERMISSIONS } from '../core/permissions';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin';

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

