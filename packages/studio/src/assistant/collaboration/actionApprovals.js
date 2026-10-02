const PROTECTED_ACTION = /\b(spend(?:ing)?|pay(?:ment)?|purchase|buy|checkout|charge|transfer|publish|post|delete|remove|erase|destroy|account|connect|disconnect|grant|revoke)\b/i;

function actionKey(profile, pluginId, action, context) {
  const actionContext = approvalContext(context);
  return JSON.stringify({ profile, pluginId, action, context: actionContext });
}

function approvalContext(context) {
  return Object.fromEntries(
    Object.entries(context).filter(([key]) => key !== 'approvalId' && key !== 'assistantProfile'),
  );
}

export function createActionApprovals({
  auditLogger,
  authorizeDanAction = () => false,
  approvalStore,
} = {}) {
  const pending = new Map();
  const approved = new Map();
  const store = {
    listPending: () => Array.from(pending, ([id, request]) => ({ id, ...request })),
    putPending: (id, request) => pending.set(id, request),
    moveToApproved(id) {
      const request = pending.get(id);
      if (!request) return null;
      pending.delete(id);
      approved.set(id, request);
      return request;
    },
    consumeApproved(id, key) {
      const request = approved.get(id);
      if (!request || request.key !== key) return false;
      approved.delete(id);
      return true;
    },
  };
  const storage = approvalStore ?? store;

  function requiresApproval(pluginId, action, context) {
    return PROTECTED_ACTION.test(
      `${pluginId} ${action} ${context.operation ?? ''} ${context.intent ?? ''}`,
    );
  }

  return {
    listPending() {
      return storage.listPending().map(({ id, ...request }) => ({
        id,
        profile: request.profile,
        pluginId: request.pluginId,
        action: request.action,
        context: request.context,
      }));
    },

    request({ profile, pluginId, action, context = {} }) {
      const id = globalThis.crypto?.randomUUID?.();
      if (!id) throw new Error('Secure randomness is required to request action approval');
      const request = {
        key: actionKey(profile, pluginId, action, context),
        profile,
        pluginId,
        action,
        context: approvalContext(context),
      };
      storage.putPending(id, request);
      auditLogger?.log?.({ type: 'action.approval_requested', profile, pluginId, action });
      return { id, profile, pluginId, action, status: 'pending' };
    },

    approve(id, identity) {
      if (!authorizeDanAction('approve-sensitive-action', identity)) {
        throw new Error('Only Dan can approve an action');
      }
      const request = storage.moveToApproved(id);
      if (!request) throw new Error('Action approval is not pending');
      auditLogger?.log?.({
        type: 'action.approved',
        reviewer: 'Dan',
        profile: request.profile,
        pluginId: request.pluginId,
        action: request.action,
      });
      return { id, profile: request.profile, status: 'approved' };
    },

    authorize({ profile, pluginId, action, context = {} }) {
      if (!requiresApproval(pluginId, action, context)) return;

      const requestId = context.approvalId;
      const cleanContext = { ...context };
      delete cleanContext.approvalId;
      const key = actionKey(profile, pluginId, action, cleanContext);
      if (!storage.consumeApproved(requestId, key)) {
        auditLogger?.log?.({ type: 'action.denied', profile, pluginId, action, reason: 'approval_required' });
        const error = new Error('This action requires Dan’s explicit approval for this exact action');
        error.code = 'ACTION_APPROVAL_REQUIRED';
        throw error;
      }
    },
  };
}
