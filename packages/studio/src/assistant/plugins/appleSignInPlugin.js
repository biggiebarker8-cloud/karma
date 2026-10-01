import { PERMISSIONS } from '../core/permissions.js';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin.js';

export function createAppleSignInPlugin({ appleAuth, ...deps }) {
  return createScopedIntegrationPlugin({
    id: 'apple-sign-in',
    requiredFlag: 'appleEnabled',
    requiredPermissions: [PERMISSIONS.APPLE_SIGN_IN],
    ...deps,
    async actionHandler(action, context = {}) {
      if (action === 'sign-in') {
        if (typeof appleAuth?.signIn !== 'function') {
          throw new Error('Apple sign-in provider is not configured');
        }
        const user = await appleAuth.signIn(context);
        if (typeof user?.id !== 'string' || !user.id) {
          throw new Error('Apple sign-in provider did not return a verified user');
        }
        return { user: { id: user.id, email: user.email ?? null } };
      }
      if (action === 'sign-out') {
        if (typeof appleAuth?.signOut !== 'function') {
          throw new Error('Apple sign-out provider is not configured');
        }
        await appleAuth.signOut(context);
        return { signedOut: true };
      }
      throw new Error(`Unsupported apple-sign-in action: ${action}`);
    },
  });
}
