import { isFlagEnabled } from './featureFlags';
import { hasPermission } from './permissions';

export function createPluginRegistry({
  featureFlags,
  grantedPermissions = [],
  auditLogger,
} = {}) {
  const plugins = new Map();

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
      const plugin = plugins.get(pluginId);
      if (!plugin) return false;

      if (plugin.requiredFlag && !isFlagEnabled(featureFlags, plugin.requiredFlag)) {
        return false;
      }

      if (plugin.requiredPermissions?.length) {
        return plugin.requiredPermissions.every((permission) =>
          hasPermission(grantedPermissions, permission),
        );
      }

      return true;
    },

    async execute(pluginId, action, context = {}) {
      const plugin = plugins.get(pluginId);
      if (!plugin) {
        throw new Error(`Plugin "${pluginId}" is not registered`);
      }

      if (!this.isAvailable(pluginId)) {
        auditLogger?.log?.({
          type: 'plugin.blocked',
          pluginId,
          reason: 'flag_or_permission_denied',
        });
        throw new Error(`Plugin "${pluginId}" is not available`);
      }

      auditLogger?.log?.({ type: 'plugin.execute', pluginId, action });
      return plugin.execute(action, context);
    },
  };
}

