export function createScopedIntegrationPlugin({
  id,
  requiredFlag = 'pluginsEnabled',
  requiredPermissions,
  rateLimiter,
  auditLogger,
  actionHandler,
}) {
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

export function createScaffoldIntegrationPlugin({
  id,
  requiredPermissions,
  actions,
  capabilities = {},
  ...deps
}) {
  const scaffold = { status: 'stubbed', executed: false, requiresConnection: true };
  return createScopedIntegrationPlugin({
    ...deps,
    id,
    requiredPermissions,
    async actionHandler(action, context = {}) {
      if (action === 'describe-capabilities') {
        return {
          ...capabilities,
          platform: id,
          supportedActions: ['describe-capabilities', ...Object.keys(actions)],
          documentationReady: true,
          ...scaffold,
        };
      }
      const handler = Object.hasOwn(actions, action) ? actions[action] : null;
      if (!handler) {
        return { platform: id, action, context, ...scaffold };
      }
      const payload = handler(context);
      for (const key of ['result', 'overview', 'profile']) {
        if (payload[key]) {
          payload[key] = {
            ...payload[key],
            executed: false,
            requiresConnection: true,
            documentationReady: true,
          };
        }
      }
      return { ...payload, platform: id, action, ...scaffold };
    },
  });
}
