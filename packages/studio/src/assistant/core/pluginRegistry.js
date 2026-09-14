import { isFlagEnabled } from './featureFlags.js';
import { hasPermission } from './permissions.js';

export function createPluginRegistry({
  featureFlags,
  grantedPermissions = [],
  auditLogger,
} = {}) {
  const plugins = new Map();

  function getAvailability(pluginId) {
    const plugin = plugins.get(pluginId);
    if (!plugin) {
      return {
        available: false,
        reasons: [`Plugin "${pluginId}" is not registered`],
      };
    }

    const reasons = [];

    if (plugin.requiredFlag && !isFlagEnabled(featureFlags, plugin.requiredFlag)) {
      reasons.push(`feature flag "${plugin.requiredFlag}" is disabled`);
    }

    if (plugin.requiredPermissions?.length) {
      const missingPermissions = plugin.requiredPermissions.filter(
        (permission) => !hasPermission(grantedPermissions, permission),
      );

      if (missingPermissions.length) {
        reasons.push(`missing permissions: ${missingPermissions.join(', ')}`);
      }
    }

    return {
      available: reasons.length === 0,
      reasons,
    };
  }

  return {
    register(plugin) {
      if (!plugin?.id) {
        throw new Error('Plugin must define id');
      }

      plugins.set(plugin.id, plugin);
      auditLogger?.log?.({ type: 'plugin.registered', pluginId: plugin.id });
    },

    list() {
      return Array.from(plugins.values());
    },

    isAvailable(pluginId) {
      return getAvailability(pluginId).available;
    },

    async execute(pluginId, action, context = {}) {
      const plugin = plugins.get(pluginId);
      if (!plugin) {
        throw new Error(`Plugin "${pluginId}" is not registered`);
      }

      const availability = getAvailability(pluginId);
      if (!availability.available) {
        auditLogger?.log?.({
          type: 'plugin.blocked',
          pluginId,
          reason: availability.reasons.join('; '),
        });
        const error = new Error(
          `Plugin "${pluginId}" is not available: ${availability.reasons.join('; ')}`,
        );
        error.code = 'PLUGIN_UNAVAILABLE';
        error.details = availability.reasons;
        throw error;
      }

      auditLogger?.log?.({ type: 'plugin.execute', pluginId, action });
      return plugin.execute(action, context);
    },
  };
}
