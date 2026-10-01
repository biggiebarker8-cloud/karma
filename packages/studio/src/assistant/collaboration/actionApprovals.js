const PROTECTED_ACTION = /\b(spend(?:ing)?|pay(?:ment)?|purchase|buy|checkout|charge|transfer|publish|post|delete|remove|erase|destroy|account|connect|disconnect|grant|revoke)\b/i;

function actionKey(profile, pluginId, action, context) {
  const actionContext = Object.fromEntries(
    Object.entries(context).filter(([key]) => key !== 'approvalId' && key !== 'assistantProfile'),
  );
  return JSON.stringify({ profile, pluginId, action, context: actionContext });
}

export function createActionApprovals({ auditLogger, authorizeDanAction = () => false } = {}) {
  const pending = new Map();
  const approved = new Map();

  function requiresApproval(pluginId, action, context) {
    return PROTECTED_ACTION.test(
      `${pluginId} ${action} ${context.operation ?? ''} ${context.intent ?? ''}`,
    );
  }

  return {
    request({ profile, pluginId, action, context = {} }) {
      const id = globalThis.crypto?.randomUUID?.();
      if (!id) throw new Error('Secure randomness is required to request action approval');
      pending.set(id, {
        key: actionKey(profile, pluginId, action, context),
        profile,
        pluginId,
        action,
      });
      auditLogger?.log?.({ type: 'action.approval_requested', profile, pluginId, action });
      return { id, profile, pluginId, action, status: 'pending' };
    },

    approve(id) {
      if (!authorizeDanAction('approve-sensitive-action')) {
        throw new Error('Only Dan can approve an action');
      }
      const request = pending.get(id);
      if (!request) throw new Error('Action approval is not pending');
      pending.delete(id);
      approved.set(id, request);
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
      const approval = approved.get(requestId);
      const cleanContext = { ...context };
      delete cleanContext.approvalId;
      const key = actionKey(profile, pluginId, action, cleanContext);
      if (!approval || approval.key !== key) {
        auditLogger?.log?.({ type: 'action.denied', profile, pluginId, action, reason: 'approval_required' });
        const error = new Error('This action requires Dan’s explicit approval for this exact action');
        error.code = 'ACTION_APPROVAL_REQUIRED';
        throw error;
      }
      approved.delete(requestId);
    },
  };
}
