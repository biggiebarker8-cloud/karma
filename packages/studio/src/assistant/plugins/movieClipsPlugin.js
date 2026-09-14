import { PERMISSIONS } from '../core/permissions';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin';

export function createMovieClipsPlugin(deps) {
  return createScopedIntegrationPlugin({
    id: 'movie-clips',
    requiredFlag: 'creativePluginsEnabled',
    requiredPermissions: [PERMISSIONS.EDIT_MOVIE_CLIPS],
    ...deps,
    async actionHandler(action, context) {
      return {
        domain: 'video',
        type: 'movie-clips',
        action,
        context,
        status: 'queued',
      };
    },
  });
}

