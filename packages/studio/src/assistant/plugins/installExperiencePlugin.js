import { PERMISSIONS } from '../core/permissions';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin';

export function createInstallExperiencePlugin({ installAdvisor, ...deps }) {
  return createScopedIntegrationPlugin({
    id: 'desktop-install',
    requiredFlag: 'installExperienceEnabled',
    requiredPermissions: [PERMISSIONS.INSTALL_GUIDE_READ],
    ...deps,
    async actionHandler(action, context = {}) {
      if (action !== 'get-install-options') {
        throw new Error(`Unsupported desktop-install action: ${action}`);
      }
      return installAdvisor.getInstallOptions(context);
    },
  });
}

