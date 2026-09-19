import { PERMISSIONS } from '../core/permissions';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin';

export function createComicsPlugin(deps) {
  return createScopedIntegrationPlugin({
    id: 'comics',
    requiredFlag: 'creativePluginsEnabled',
    requiredPermissions: [PERMISSIONS.DESIGN_COMICS],
    ...deps,
    async actionHandler(action, context) {
      return {
        domain: 'storytelling',
        type: 'comics',
        action,
        context,
        status: 'queued',
      };
    },
  });
}

