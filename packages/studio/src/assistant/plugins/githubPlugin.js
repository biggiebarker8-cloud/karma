import { PERMISSIONS } from '../core/permissions.js';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin.js';

const SUPPORTED_ACTIONS = Object.freeze([
  'get-repository',
  'get-file',
  'search-code',
]);

export function createGitHubPlugin({ githubTransport, ...deps } = {}) {
  return createScopedIntegrationPlugin({
    id: 'github',
    requiredFlag: 'githubEnabled',
    requiredPermissions: [PERMISSIONS.GITHUB_READ],
    ...deps,
    async actionHandler(action, context = {}) {
      if (typeof githubTransport !== 'function') {
        throw new Error('GitHub integration is not configured; set GITHUB_TOKEN on the server');
      }

      const { owner, repo } = context;
      switch (action) {
        case 'describe-capabilities':
          return { platform: 'github', supportedActions: SUPPORTED_ACTIONS, readOnly: true };
        case 'get-repository':
          return githubTransport({ owner, repo });
        case 'get-file':
          return githubTransport({
            owner,
            repo,
            path: `/contents/${(context.path || '').split('/').map(encodeURIComponent).join('/')}`,
            query: context.ref ? { ref: context.ref } : {},
          });
        case 'search-code':
          return githubTransport({
            owner,
            repo,
            path: '/search/code',
            globalPath: true,
            query: { q: `${context.query || ''} repo:${owner}/${repo}`, per_page: context.perPage || 20 },
          });
        default:
          throw new Error(`Unsupported github action: ${action}`);
      }
    },
  });
}
