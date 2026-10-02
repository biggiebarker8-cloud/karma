const MAX_BODY_BYTES = 64 * 1024;

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export function createAssistantHttpHandler({
  assistantProfiles,
  getAuthenticatedIdentity,
  danUserId,
} = {}) {
  if (!assistantProfiles || typeof getAuthenticatedIdentity !== 'function'
    || typeof danUserId !== 'string' || !danUserId) {
    throw new Error('Assistant HTTP handling requires profiles, authenticated identity, and Dan’s user ID');
  }

  return async function handleAssistantRequest(request) {
    let identity;
    try {
      identity = await getAuthenticatedIdentity(request);
    } catch {
      return jsonResponse({ error: 'Authentication required' }, 401);
    }
    if (!identity || typeof identity.id !== 'string' || !identity.id) {
      return jsonResponse({ error: 'Authentication required' }, 401);
    }

    const requireDan = () => {
      if (identity.id !== danUserId) throw httpError('Dan’s authenticated session is required', 403);
    };
    const readBody = async () => {
      const length = Number(request.headers.get('content-length'));
      if (Number.isFinite(length) && length > MAX_BODY_BYTES) {
        throw httpError('Request body is too large', 413);
      }
      const text = await request.text();
      if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
        throw httpError('Request body is too large', 413);
      }
      let body;
      try {
        body = JSON.parse(text);
      } catch {
        throw httpError('A valid JSON object is required', 400);
      }
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw httpError('A JSON object is required', 400);
      }
      return body;
    };

    try {
      const url = new URL(request.url);
      const path = url.pathname.replace(/\/+$/, '');
      const method = request.method.toUpperCase();

      if (method === 'GET' && path === '/api/assistant/profiles') {
        return jsonResponse({ profiles: assistantProfiles.list() });
      }
      if (method === 'GET' && path === '/api/assistant/session') {
        return jsonResponse({ canReview: identity.id === danUserId });
      }
      if (method === 'GET' && path === '/api/assistant/history') {
        const profile = url.searchParams.get('profile');
        return jsonResponse({ history: assistantProfiles.history(profile) });
      }
      if (method === 'GET' && path === '/api/assistant/shared-facts') {
        return jsonResponse({
          approved: assistantProfiles.sharedKnowledge(),
          pending: assistantProfiles.pendingBusinessFacts(),
        });
      }
      if (method === 'GET' && path === '/api/assistant/approvals') {
        return jsonResponse({
          approvals: identity.id === danUserId ? assistantProfiles.pendingActionApprovals() : [],
        });
      }
      if (method !== 'POST') throw httpError('Not found', 404);

      const body = await readBody();
      if (path === '/api/assistant/chat') {
        return jsonResponse({
          replies: await assistantProfiles.chat(body.mode, body.prompt, {
            includeReview: body.includeReview === true,
          }),
        });
      }
      if (path === '/api/assistant/shared-facts') {
        requireDan();
        return jsonResponse({
          fact: assistantProfiles.proposeBusinessFact(body.fact, identity),
        }, 201);
      }
      if (path === '/api/assistant/shared-facts/review') {
        requireDan();
        return jsonResponse({
          fact: assistantProfiles.reviewBusinessFact(body.id, body.approved, identity),
        });
      }
      if (path === '/api/assistant/approvals') {
        return jsonResponse({
          approval: assistantProfiles.requestActionApproval(
            body.profile,
            body.pluginId,
            body.action,
            body.context,
          ),
        }, 201);
      }
      if (path === '/api/assistant/approvals/approve') {
        requireDan();
        return jsonResponse({
          approval: assistantProfiles.approveAction(body.id, identity),
        });
      }
      if (path === '/api/assistant/tools') {
        return jsonResponse({
          result: await assistantProfiles.executeTool(
            body.profile,
            body.pluginId,
            body.action,
            body.context,
          ),
        });
      }
      throw httpError('Not found', 404);
    } catch (error) {
      return jsonResponse({
        error: error.message || 'Assistant request failed',
        code: error.code,
      }, error.status || (error.code ? 403 : 400));
    }
  };
}
