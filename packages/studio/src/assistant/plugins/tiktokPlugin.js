import { PERMISSIONS } from '../core/permissions.js';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin.js';

export function createTikTokPlugin(deps) {
  return createScopedIntegrationPlugin({
    id: 'tiktok',
    requiredPermissions: [PERMISSIONS.POST_TIKTOK],
    ...deps,
    async actionHandler(action, context) {
      return { platform: 'tiktok', action, context, status: 'queued' };
    },
  });
}
