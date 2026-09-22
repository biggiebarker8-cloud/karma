import { PERMISSIONS } from '../core/permissions.js';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin.js';

export function createHoodieDesignPlugin(deps) {
  return createScopedIntegrationPlugin({
    id: 'hoodie-design',
    requiredFlag: 'creativePluginsEnabled',
    requiredPermissions: [PERMISSIONS.DESIGN_HOODIE],
    ...deps,
    async actionHandler(action, context) {
      return {
        domain: 'fashion',
        type: 'hoodie-design',
        action,
        context,
        status: 'queued',
      };
    },
  });
}

