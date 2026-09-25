import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin.js';

export function createTikTokPlugin(deps) {
  return createScopedIntegrationPlugin({
    id: 'tiktok',
    ...deps,
    async actionHandler(action, context) {
      return { platform: 'tiktok', action, context, status: 'queued' };
    },
  });
}
