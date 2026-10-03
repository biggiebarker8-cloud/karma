import { PERMISSIONS } from '../core/permissions.js';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin.js';

const SUPPORTED_ACTIONS = Object.freeze([
  'get-repository',
  'get-file',
  'search-code',
]);

export function createGitHubPlugin({
  githubTransport,
  allowedRepositories = [],
  ...deps
} = {}) {
  const repositoryAllowlist = new Set(
    allowedRepositories
      .filter((repository) => typeof repository === 'string')
      .map((repository) => repository.trim().toLowerCase())
      .filter(Boolean),
  );

  return createScopedIntegrationPlugin({
    id: 'github',
    requiredFlag: 'githubEnabled',
    requiredPermissions: [PERMISSIONS.GITHUB_READ],
    ...deps,
    async actionHandler(action, context = {}) {
      if (action === 'describe-capabilities') {
        return { platform: 'github', supportedActions: SUPPORTED_ACTIONS, readOnly: true };
      }
      if (typeof githubTransport !== 'function') {
        throw new Error('GitHub integration is not configured; set GITHUB_TOKEN on the server');
      }

      const { owner, repo } = context;
      if (typeof owner !== 'string' || typeof repo !== 'string'
        || !repositoryAllowlist.has(`${owner}/${repo}`.trim().toLowerCase())) {
        throw new Error('GitHub request denied: repository is not allowlisted');
      }
      const page = context.page ?? 1;
      const perPage = context.perPage ?? 20;
      if (!Number.isInteger(page) || page < 1
        || !Number.isInteger(perPage) || perPage < 1 || perPage > 100) {
        throw new Error('GitHub pagination requires page >= 1 and perPage between 1 and 100');
      }

      switch (action) {
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
            query: {
              q: `${context.query || ''} repo:${owner}/${repo}`,
              per_page: perPage,
              page,
            },
          });
        default:
          throw new Error(`Unsupported github action: ${action}`);
      }
    },
  });
}
