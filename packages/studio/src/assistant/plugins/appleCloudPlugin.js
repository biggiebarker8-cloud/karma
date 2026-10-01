import { PERMISSIONS } from '../core/permissions.js';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin.js';

export function createAppleCloudPlugin({ appleAuth, appleCloud, ...deps }) {
  return createScopedIntegrationPlugin({
    id: 'apple-cloud',
    requiredFlag: 'appleEnabled',
    requiredPermissions: [PERMISSIONS.APPLE_CLOUD_CONNECT],
    ...deps,
    async actionHandler(action, context = {}) {
      const methods = {
        'connect': 'connect',
        'get-status': 'getStatus',
        'disconnect': 'disconnect',
      };
      const method = methods[action];
      if (!method) {
        throw new Error(`Unsupported apple-cloud action: ${action}`);
      }
      if (typeof appleAuth?.getSession !== 'function' || typeof appleCloud?.[method] !== 'function') {
        throw new Error('Apple CloudKit provider is not configured');
      }
      const session = await appleAuth.getSession(context);
      if (typeof session?.userId !== 'string' || !session.userId) {
        throw new Error('Apple cloud connection requires an authenticated session');
      }
      const result = await appleCloud[method](session);
      return { connected: action === 'disconnect' ? false : result?.connected === true };
    },
  });
}
