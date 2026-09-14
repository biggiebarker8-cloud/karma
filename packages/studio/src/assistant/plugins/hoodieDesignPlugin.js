import { PERMISSIONS } from '../core/permissions';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin';

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

