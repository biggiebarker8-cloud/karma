import { useEffect, useState } from 'react';

async function request(path, body) {
  const response = await fetch(path, {
    method: body === undefined ? 'GET' : 'POST',
    credentials: 'same-origin',
    headers: body === undefined ? {} : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Assistant request failed');
  return result;
}

export default function TwoAssistantChat() {
  const [mode, setMode] = useState('karma');
  const [includeReview, setIncludeReview] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [factDraft, setFactDraft] = useState('');
  const [history, setHistory] = useState([]);
  const [facts, setFacts] = useState({ approved: [], pending: [] });
  const [approvals, setApprovals] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function loadHistory(selectedMode = mode) {
    const profiles = selectedMode === 'together'
      ? ['karma', 'collaborator']
      : [selectedMode];
    const histories = await Promise.all(profiles.map(async (profile) => {
      const result = await request(`/api/assistant/history?profile=${profile}`);
      return result.history;
    }));
    setHistory(histories.flat());
  }

  async function loadReviewData() {
    const [factResult, approvalResult] = await Promise.all([
      request('/api/assistant/shared-facts'),
      request('/api/assistant/approvals'),
    ]);
    setFacts(factResult);
    setApprovals(approvalResult.approvals);
  }

  useEffect(() => {
    loadHistory().catch((reason) => setError(reason.message));
  }, [mode]);

  useEffect(() => {
    loadReviewData().catch((reason) => setError(reason.message));
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (!prompt.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      await request('/api/assistant/chat', { mode, prompt: prompt.trim(), includeReview });
      setPrompt('');
      await loadHistory();
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  }

  async function proposeFact(event) {
    event.preventDefault();
    if (!factDraft.trim()) return;
    setBusy(true);
    setError('');
    try {
      await request('/api/assistant/shared-facts', { fact: factDraft.trim() });
      setFactDraft('');
      await loadReviewData();
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  }

  async function reviewFact(id, approved) {
    setBusy(true);
    setError('');
    try {
      await request('/api/assistant/shared-facts/review', { id, approved });
      await loadReviewData();
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  }

  async function approveAction(id) {
    setBusy(true);
    setError('');
    try {
      await request('/api/assistant/approvals/approve', { id });
      await loadReviewData();
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ margin: '0 auto', maxWidth: 900, padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Two-assistant chat</h1>
      <form onSubmit={submit}>
        <label>
          Chat mode{' '}
          <select value={mode} onChange={(event) => setMode(event.target.value)}>
            <option value="karma">Karma</option>
            <option value="collaborator">Collaborator</option>
            <option value="together">Together</option>
          </select>
        </label>
        {mode === 'together' && (
          <label style={{ display: 'block', marginTop: 8 }}>
            <input
              type="checkbox"
              checked={includeReview}
              onChange={(event) => setIncludeReview(event.target.checked)}
            />
            Include one Karma review
          </label>
        )}
        <label style={{ display: 'block', marginTop: 12 }}>
          Message
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            required
            rows={3}
            style={{ display: 'block', width: '100%', marginTop: 4 }}
          />
        </label>
        <button type="submit" disabled={busy || !prompt.trim()}>
          {busy ? 'Working…' : 'Send'}
        </button>
      </form>

      <section aria-labelledby="history-title">
        <h2 id="history-title">Conversation history</h2>
        {history.map((entry, index) => (
          <article key={`${entry.profile}-${index}`}>
            <strong>{entry.profile === 'karma' ? 'Karma' : 'Collaborator'} · {entry.role}</strong>
            <p style={{ whiteSpace: 'pre-wrap' }}>{entry.content}</p>
          </article>
        ))}
        {!history.length && <p>No conversation history for this mode yet.</p>}
      </section>

      <section aria-labelledby="shared-facts-title">
        <h2 id="shared-facts-title">Shared facts</h2>
        <ul>
          {facts.approved.map((fact, index) => <li key={`${fact}-${index}`}>{fact}</li>)}
        </ul>
        <form onSubmit={proposeFact}>
          <label>
            Propose a fact for shared memory
            <input
              value={factDraft}
              onChange={(event) => setFactDraft(event.target.value)}
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            />
          </label>
          <button type="submit" disabled={busy || !factDraft.trim()}>Submit for review</button>
        </form>
        <h3>Awaiting review</h3>
        {facts.pending.map((fact) => (
          <article key={fact.id}>
            <p>{fact.fact}</p>
            <button type="button" disabled={busy} onClick={() => reviewFact(fact.id, true)}>
              Approve fact
            </button>
            <button type="button" disabled={busy} onClick={() => reviewFact(fact.id, false)}>
              Reject fact
            </button>
          </article>
        ))}
        {!facts.pending.length && <p>No facts are awaiting review.</p>}
      </section>

      <section aria-labelledby="approvals-title">
        <h2 id="approvals-title">Sensitive action approvals</h2>
        {approvals.map((approval) => (
          <article key={approval.id}>
            <p>
              {approval.profile}: {approval.pluginId} / {approval.action}
            </p>
            <button type="button" disabled={busy} onClick={() => approveAction(approval.id)}>
              Approve once
            </button>
          </article>
        ))}
        {!approvals.length && <p>No actions are awaiting approval.</p>}
      </section>

      <p role="status" aria-live="polite">{error}</p>
    </main>
  );
}
