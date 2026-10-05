import { PERMISSIONS } from '../core/permissions.js';
import { createScaffoldIntegrationPlugin } from './createScopedIntegrationPlugin.js';

export function createAmazonPlugin(deps) {
  const store = (context) => context.store || 'default-amazon-store';
  return createScaffoldIntegrationPlugin({
    ...deps,
    id: 'amazon',
    requiredPermissions: [PERMISSIONS.AMAZON_WRITE],
    capabilities: { supportsStoreOperations: true },
    actions: {
      'get-store-overview': (context) => ({
        overview: {
          store: store(context),
          sections: ['orders', 'inventory', 'pricing', 'promotions', 'account-health'],
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
          fulfillmentChannel: context.fulfillmentChannel || 'FBA',
          skus: Array.isArray(context.skus) ? context.skus : [],
          levels: [],
        },
      }),
      'update-listing-price': (context) => ({
        result: {
          store: store(context),
          sku: context.sku || null,
          price: typeof context.price === 'number' ? context.price : null,
          applied: false,
        },
      }),
      'create-promotion': (context) => ({
        result: {
          store: store(context),
          promotionId: context.promotionId || null,
          percentageOff: typeof context.percentageOff === 'number' ? context.percentageOff : null,
          created: false,
        },
      }),
      'check-account-health': (context) => ({
        result: {
          store: store(context),
          metrics: ['order-defect-rate', 'late-shipment-rate', 'policy-compliance'],
          summaryAvailable: false,
        },
      }),
    },
  });
}
