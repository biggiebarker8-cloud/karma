import { PERMISSIONS } from '../core/permissions.js';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin.js';
import {
  getMicrosoftHubCatalog,
  getMicrosoftHubPage,
} from '../../microsoft/microsoftHubCatalog.js';

const MICROSOFT_HUB_SUPPORTED_ACTIONS = Object.freeze([
  'describe-capabilities',
  'get-hub-overview',
  'list-pages',
  'get-page',
  'get-ios-guidance',
]);

export function createMicrosoftHubPlugin(deps) {
  return createScopedIntegrationPlugin({
    id: 'microsoft-hub',
    requiredFlag: 'microsoftHubEnabled',
    requiredPermissions: [PERMISSIONS.MICROSOFT_HUB_READ],
    ...deps,
    async actionHandler(action, context = {}) {
      const catalog = getMicrosoftHubCatalog();

      switch (action) {
        case 'describe-capabilities':
          return {
            platform: 'microsoft-hub',
            status: 'ready',
            supportedActions: MICROSOFT_HUB_SUPPORTED_ACTIONS,
            pageCount: catalog.pages.length,
            iosFriendly: true,
          };
        case 'get-hub-overview':
          return {
            platform: 'microsoft-hub',
            status: 'ready',
            hub: catalog,
          };
        case 'list-pages':
          return {
            platform: 'microsoft-hub',
            status: 'ready',
            pages: catalog.pages.map(({ id, title, description, cards }) => ({
              id,
              title,
              description,
              cardCount: cards.length,
            })),
          };
        case 'get-page': {
          if (!context.pageId) {
            throw new Error('microsoft-hub get-page requires a pageId');
          }
          const page = getMicrosoftHubPage(context.pageId);
          if (!page) {
            const supportedPageIds = catalog.pages.map((catalogPage) => catalogPage.id).join(', ');
            throw new Error(
              `Unsupported microsoft-hub page: ${context.pageId}. Supported pages: ${supportedPageIds}`,
            );
          }
          return {
            platform: 'microsoft-hub',
            status: 'ready',
            page,
          };
        }
        case 'get-ios-guidance':
          return {
            platform: 'microsoft-hub',
            status: 'ready',
            iosExperience: catalog.iosExperience,
          };
        default:
          throw new Error(`Unsupported microsoft-hub action: ${action}`);
      }
    },
  });
}
