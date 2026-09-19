import { PERMISSIONS } from '../core/permissions';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin';

export function createFacebookPlugin(deps) {
  return createScopedIntegrationPlugin({
    id: 'facebook',
    requiredPermissions: [PERMISSIONS.POST_FACEBOOK],
    ...deps,
    async actionHandler(action, context) {
      return { platform: 'facebook', action, context, status: 'queued' };
    },
  });
}

