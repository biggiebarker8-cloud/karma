export function createScopedIntegrationPlugin({
  id,
  requiredFlag = 'pluginsEnabled',
  requiredPermissions,
  rateLimiter,
  auditLogger,
  actionHandler,
}) {
  if (typeof actionHandler !== 'function') {
    throw new Error(`Plugin ${id} requires an actionHandler`);
  }

  return {
    id,
    requiredFlag,
    requiredPermissions,
    async execute(action, context = {}) {
      const scope = `${id}:${action}`;
      if (rateLimiter && !rateLimiter.canProceed(scope)) {
        auditLogger?.log?.({ type: 'plugin.rate_limited', pluginId: id, action });
        throw new Error(`${id} rate limit reached`);
      }

      auditLogger?.log?.({ type: 'plugin.action', pluginId: id, action });
      return actionHandler(action, context);
    },
  };
}
