import { PERMISSIONS } from '../core/permissions.js';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin.js';

export function createInstallExperiencePlugin({ installAdvisor, ...deps }) {
  if (typeof installAdvisor?.getInstallOptions !== 'function') {
    throw new Error('desktop-install plugin requires an installAdvisor');
  }

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
