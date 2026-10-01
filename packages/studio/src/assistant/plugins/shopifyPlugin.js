import { PERMISSIONS } from '../core/permissions.js';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin.js';

const SHOPIFY_SUPPORTED_ACTIONS = Object.freeze([
  'describe-capabilities',
  'get-store-overview',
  'list-orders',
  'get-inventory-levels',
  'update-inventory',
  'create-discount',
  'sync-product-listing',
]);

function getStoreOverview(context = {}) {
  return {
    store: context.store || 'default-shopify-store',
    sections: ['orders', 'inventory', 'discounts', 'product-catalog'],
    automationReady: true,
    documentationReady: true,
  };
}

function listOrders(context = {}) {
  return {
    store: context.store || 'default-shopify-store',
    status: context.status || 'any',
    limit: context.limit || 25,
    orders: [],
    documentationReady: true,
  };
}

function getInventoryLevels(context = {}) {
  return {
    store: context.store || 'default-shopify-store',
    locationId: context.locationId || null,
    skus: Array.isArray(context.skus) ? context.skus : [],
    levels: [],
    documentationReady: true,
  };
}

function updateInventory(context = {}) {
  return {
    store: context.store || 'default-shopify-store',
    sku: context.sku || null,
    quantity: typeof context.quantity === 'number' ? context.quantity : null,
    applied: Boolean(context.sku) && typeof context.quantity === 'number',
    documentationReady: true,
  };
}

function createDiscount(context = {}) {
  return {
    store: context.store || 'default-shopify-store',
    code: context.code || null,
    percentageOff: typeof context.percentageOff === 'number' ? context.percentageOff : null,
    created: Boolean(context.code),
    documentationReady: true,
  };
}

function syncProductListing(context = {}) {
  return {
    store: context.store || 'default-shopify-store',
    productId: context.productId || null,
    synced: Boolean(context.productId),
    documentationReady: true,
  };
}

export function createShopifyPlugin(deps) {
  return createScopedIntegrationPlugin({
    id: 'shopify',
    requiredPermissions: [PERMISSIONS.SHOPIFY_WRITE],
    ...deps,
    async actionHandler(action, context = {}) {
      switch (action) {
        case 'describe-capabilities':
          return {
            platform: 'shopify',
            supportedActions: SHOPIFY_SUPPORTED_ACTIONS,
            supportsStoreOperations: true,
            documentationReady: true,
            status: 'ready',
          };
        case 'get-store-overview':
          return {
            platform: 'shopify',
            action,
            status: 'ready',
            overview: getStoreOverview(context),
          };
        case 'list-orders':
          return {
            platform: 'shopify',
            action,
            status: 'ready',
            result: listOrders(context),
          };
        case 'get-inventory-levels':
          return {
            platform: 'shopify',
            action,
            status: 'ready',
            result: getInventoryLevels(context),
          };
        case 'update-inventory':
          return {
            platform: 'shopify',
            action,
            status: 'ready',
            result: updateInventory(context),
          };
        case 'create-discount':
          return {
            platform: 'shopify',
            action,
            status: 'ready',
            result: createDiscount(context),
          };
        case 'sync-product-listing':
          return {
            platform: 'shopify',
            action,
            status: 'ready',
            result: syncProductListing(context),
          };
        default:
          return { platform: 'shopify', action, context, status: 'queued' };
      }
    },
  });
}

