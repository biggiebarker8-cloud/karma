import { PERMISSIONS } from '../core/permissions.js';
import { createScopedIntegrationPlugin } from './createScopedIntegrationPlugin.js';

const AMAZON_SUPPORTED_ACTIONS = Object.freeze([
  'describe-capabilities',
  'get-store-overview',
  'list-orders',
  'get-inventory-levels',
  'update-listing-price',
  'create-promotion',
  'check-account-health',
]);

function getStoreOverview(context = {}) {
  return {
    store: context.store || 'default-amazon-store',
    sections: ['orders', 'inventory', 'pricing', 'promotions', 'account-health'],
    automationReady: true,
    documentationReady: true,
  };
}

function listOrders(context = {}) {
  return {
    store: context.store || 'default-amazon-store',
    status: context.status || 'any',
    limit: context.limit || 25,
    orders: [],
    documentationReady: true,
  };
}

function getInventoryLevels(context = {}) {
  return {
    store: context.store || 'default-amazon-store',
    fulfillmentChannel: context.fulfillmentChannel || 'FBA',
    skus: Array.isArray(context.skus) ? context.skus : [],
    levels: [],
    documentationReady: true,
  };
}

function updateListingPrice(context = {}) {
  return {
    store: context.store || 'default-amazon-store',
    sku: context.sku || null,
    price: typeof context.price === 'number' ? context.price : null,
    applied: Boolean(context.sku) && typeof context.price === 'number',
    documentationReady: true,
  };
}

function createPromotion(context = {}) {
  return {
    store: context.store || 'default-amazon-store',
    promotionId: context.promotionId || null,
    percentageOff: typeof context.percentageOff === 'number' ? context.percentageOff : null,
    created: Boolean(context.promotionId),
    documentationReady: true,
  };
}

function checkAccountHealth(context = {}) {
  return {
    store: context.store || 'default-amazon-store',
    metrics: ['order-defect-rate', 'late-shipment-rate', 'policy-compliance'],
    summaryAvailable: false,
    documentationReady: true,
  };
}

export function createAmazonPlugin(deps) {
  return createScopedIntegrationPlugin({
    id: 'amazon',
    requiredPermissions: [PERMISSIONS.AMAZON_WRITE],
    ...deps,
    async actionHandler(action, context = {}) {
      switch (action) {
        case 'describe-capabilities':
          return {
            platform: 'amazon',
            supportedActions: AMAZON_SUPPORTED_ACTIONS,
            supportsStoreOperations: true,
            documentationReady: true,
            status: 'ready',
          };
        case 'get-store-overview':
          return {
            platform: 'amazon',
            action,
            status: 'ready',
            overview: getStoreOverview(context),
          };
        case 'list-orders':
          return {
            platform: 'amazon',
            action,
            status: 'ready',
            result: listOrders(context),
          };
        case 'get-inventory-levels':
          return {
            platform: 'amazon',
            action,
            status: 'ready',
            result: getInventoryLevels(context),
          };
        case 'update-listing-price':
          return {
            platform: 'amazon',
            action,
            status: 'ready',
            result: updateListingPrice(context),
          };
        case 'create-promotion':
          return {
            platform: 'amazon',
            action,
            status: 'ready',
            result: createPromotion(context),
          };
        case 'check-account-health':
          return {
            platform: 'amazon',
            action,
            status: 'ready',
            result: checkAccountHealth(context),
          };
        default:
          return { platform: 'amazon', action, context, status: 'queued' };
      }
    },
  });
}

