const loginPanel = document.querySelector('#login-panel');
const workspace = document.querySelector('#workspace');
const statusText = document.querySelector('#status');
let csrfToken = '';
let canReview = false;

function setStatus(message = '') {
  statusText.textContent = message;
}

async function api(path, body, { login = false } = {}) {
  const headers = {};
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (body !== undefined && !login) headers['x-csrf-token'] = csrfToken;
  const response = await fetch(path, {
    method: body === undefined ? 'GET' : 'POST',
    credentials: 'same-origin',
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = response.status === 204 ? {} : await response.json();
  if (!response.ok) throw new Error(result.error || 'Request failed');
  return result;
}

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function setSignedIn(user) {
  loginPanel.hidden = true;
  workspace.hidden = false;
  document.querySelector('#user-label').textContent = user.id;
  document.querySelector('#fact-form').hidden = !canReview;
  document.querySelector('#approvals-panel').hidden = !canReview;
}

async function loadHistory() {
  const mode = document.querySelector('#chat-mode').value;
  const ids = mode === 'together' ? ['karma', 'collaborator'] : [mode];
  const historyNode = document.querySelector('#history');
  historyNode.replaceChildren();
  const results = await Promise.all(ids.map((profile) => (
    api(`/api/assistant/history?profile=${encodeURIComponent(profile)}`)
  )));
  const entries = results.flatMap((result) => result.history);
  if (!entries.length) {
    historyNode.append(element('p', 'No conversation history for this mode yet.'));
    return;
  }
  for (const entry of entries) {
    const article = element('article', undefined, 'entry');
    article.append(element('strong', `${entry.profile === 'karma' ? 'Karma' : 'Collaborator'} · ${entry.role}`));
    article.append(element('p', entry.content));
    historyNode.append(article);
  }
}

async function loadFacts() {
  const result = await api('/api/assistant/shared-facts');
  const approvedNode = document.querySelector('#approved-facts');
  approvedNode.replaceChildren();
  for (const fact of result.approved) approvedNode.append(element('li', fact));
  const pendingNode = document.querySelector('#pending-facts');
  pendingNode.replaceChildren();
  if (!canReview) return;
  pendingNode.append(element('h3', 'Awaiting review'));
  if (!result.pending.length) pendingNode.append(element('p', 'No facts are awaiting review.'));
  for (const fact of result.pending) {
    const article = element('article', undefined, 'entry');
    article.append(element('p', fact.fact));
    for (const [label, approved] of [['Approve fact', true], ['Reject fact', false]]) {
      const button = element('button', label);
      button.type = 'button';
      button.addEventListener('click', () => act(async () => {
        await api('/api/assistant/shared-facts/review', { id: fact.id, approved });
        await loadFacts();
      }));
      article.append(button);
    }
    pendingNode.append(article);
  }
}

async function loadApprovals() {
  if (!canReview) return;
  const { approvals } = await api('/api/assistant/approvals');
  const node = document.querySelector('#approvals');
  node.replaceChildren();
  if (!approvals.length) {
    node.append(element('p', 'No actions are awaiting approval.'));
    return;
  }
  for (const approval of approvals) {
    const article = element('article', undefined, 'entry');
    article.append(element('strong', `${approval.profile}: ${approval.pluginId} / ${approval.action}`));
    article.append(element('pre', JSON.stringify(approval.context, null, 2), 'approval-context'));
    const button = element('button', 'Approve once');
    button.type = 'button';
    button.addEventListener('click', () => act(async () => {
      await api('/api/assistant/approvals/approve', { id: approval.id });
      await loadApprovals();
    }));
    article.append(button);
    node.append(article);
  }
}

async function loadWorkspaceData() {
  await Promise.all([loadHistory(), loadFacts(), loadApprovals()]);
}

async function act(operation) {
  setStatus('');
  try {
    await operation();
  } catch (error) {
    setStatus(error.message);
  }
}

document.querySelector('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus('');
  try {
    const result = await api('/api/login', {
      password: document.querySelector('#password').value,
    }, { login: true });
    csrfToken = result.csrfToken;
    canReview = true;
    setSignedIn(result.user);
    await loadWorkspaceData();
  } catch (error) {
    setStatus(error.message);
  }
});

document.querySelector('#chat-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = document.querySelector('#send-button');
  button.disabled = true;
  setStatus('');
  try {
    const result = await api('/api/assistant/chat', {
      mode: document.querySelector('#chat-mode').value,
      prompt: document.querySelector('#prompt').value.trim(),
      includeReview: document.querySelector('#include-review').checked,
    });
    document.querySelector('#prompt').value = '';
    const replies = document.createElement('div');
    for (const reply of result.replies) {
      const article = element('article', undefined, 'entry');
      article.append(element('strong', reply.assistant));
      article.append(element('p', reply.content));
      replies.append(article);
    }
    document.querySelector('#history').prepend(replies);
    await loadHistory();
  } catch (error) {
    setStatus(error.message);
  } finally {
    button.disabled = false;
  }
});

document.querySelector('#chat-mode').addEventListener('change', () => {
  const together = document.querySelector('#chat-mode').value === 'together';
  document.querySelector('#review-option').hidden = !together;
  act(loadHistory);
});

document.querySelector('#fact-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const input = document.querySelector('#fact-input');
  await act(async () => {
    await api('/api/assistant/shared-facts', { fact: input.value.trim() });
    input.value = '';
    await loadFacts();
  });
});

document.querySelector('#logout-button').addEventListener('click', async () => {
  await act(async () => {
    await api('/api/assistant/logout', {});
    csrfToken = '';
    canReview = false;
    workspace.hidden = true;
    loginPanel.hidden = false;
    document.querySelector('#password').value = '';
  });
});

async function restoreSession() {
  try {
    const result = await api('/api/assistant/session');
    csrfToken = result.csrfToken;
    canReview = result.canReview;
    setSignedIn(result.user);
    await loadWorkspaceData();
  } catch (error) {
    if (error.message !== 'Authentication required') setStatus(error.message);
  }
}

restoreSession();

if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  }, { once: true });
}
