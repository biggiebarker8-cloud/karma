import { PERMISSIONS } from '../core/permissions.js';
import { createScaffoldIntegrationPlugin } from './createScopedIntegrationPlugin.js';

export function createShopifyPlugin(deps) {
  const store = (context) => context.store || 'default-shopify-store';
  return createScaffoldIntegrationPlugin({
    ...deps,
    id: 'shopify',
    requiredPermissions: [PERMISSIONS.SHOPIFY_WRITE],
    capabilities: { supportsStoreOperations: true },
    actions: {
      'get-store-overview': (context) => ({
        overview: {
          store: store(context),
          sections: ['orders', 'inventory', 'discounts', 'product-catalog'],
          automationReady: false,
        },
      }),
      'list-orders': (context) => ({
        result: {
          store: store(context),
          status: context.status || 'any',
          limit: context.limit || 25,
          orders: [],
        },
      }),
      'get-inventory-levels': (context) => ({
        result: {
          store: store(context),
          locationId: context.locationId || null,
          skus: Array.isArray(context.skus) ? context.skus : [],
          levels: [],
        },
      }),
      'update-inventory': (context) => ({
        result: {
          store: store(context),
          sku: context.sku || null,
          quantity: typeof context.quantity === 'number' ? context.quantity : null,
          applied: false,
        },
      }),
      'create-discount': (context) => ({
        result: {
          store: store(context),
          code: context.code || null,
          percentageOff: typeof context.percentageOff === 'number' ? context.percentageOff : null,
          created: false,
        },
      }),
      'sync-product-listing': (context) => ({
        result: { store: store(context), productId: context.productId || null, synced: false },
      }),
    },
  });
}
