import { useMemo, useState } from 'react';

const styles = {
  shell: {
    margin: '0 auto',
    maxWidth: '1120px',
    padding: '16px',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: '#111827',
  },
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '16px',
    background: '#ffffff',
    marginBottom: '12px',
  },
  toolbar: {
    display: 'grid',
    gap: '12px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center',
  },
  button: {
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    background: '#f9fafb',
    minHeight: '40px',
    padding: '8px 12px',
    cursor: 'pointer',
  },
  primaryButton: {
    border: 'none',
    background: '#111827',
    color: '#ffffff',
  },
  textarea: {
    width: '100%',
    minHeight: '120px',
    borderRadius: '12px',
    border: '1px solid #d1d5db',
    padding: '12px',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  input: {
    width: '100%',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    padding: '8px 10px',
  },
  bubbleUser: {
    background: '#eef2ff',
  },
  bubbleAssistant: {
    background: '#f9fafb',
  },
  codeBlock: {
    background: '#111827',
    color: '#f9fafb',
    borderRadius: '10px',
    padding: '12px',
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
  },
};

function downloadTextFile(content, fileName) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function SkillSelector({ skills, value, onChange, disabled }) {
  return (
    <select style={styles.input} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled}>
      {skills.map((skill) => (
        <option key={skill.id} value={skill.id}>
          {skill.title}
        </option>
      ))}
    </select>
  );
}

function MultiSkillSelector({ skills, selectedSkills, onToggle, disabled }) {
  return (
    <div style={styles.row}>
      {skills.map((skill) => (
        <label key={skill.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="checkbox"
            checked={selectedSkills.includes(skill.id)}
            disabled={disabled}
            onChange={() => onToggle(skill.id)}
          />
          {skill.title}
        </label>
      ))}
    </div>
  );
}

function renderBlock(block) {
  if (block.type === 'code') {
    return (
      <div key={`${block.type}-${block.title}`} style={styles.card}>
        <strong>{block.title}</strong>
        <pre style={styles.codeBlock}>{block.code}</pre>
        <div style={styles.row}>
          <button style={styles.button} type="button" onClick={() => navigator.clipboard.writeText(block.code)}>
            Copy
          </button>
          <button
            style={styles.button}
            type="button"
            onClick={() => downloadTextFile(block.code, block.exportFileName || 'karma-code.txt')}
          >
            Export
          </button>
        </div>
      </div>
    );
  }

  if (block.type === 'image' || block.type === 'comic') {
    return (
      <div key={`${block.type}-${block.title}`} style={styles.card}>
        <strong>{block.title}</strong>
        <p>{block.description || block.content}</p>
        {block.previewUrl ? <img src={block.previewUrl} alt={block.title} style={{ width: '100%', borderRadius: '10px' }} /> : null}
      </div>
    );
  }

  if (block.type === 'asset') {
    return (
      <div key={`${block.type}-${block.title}`} style={styles.card}>
        <strong>{block.title}</strong>
        <div style={styles.row}>
          <button
            style={styles.button}
            type="button"
            onClick={() => downloadTextFile(block.content || '', block.downloadName || 'karma-asset.txt')}
          >
            {block.label || 'Download'}
          </button>
        </div>
      </div>
    );
  }

  if (block.type === 'reference') {
    return (
      <div key={`${block.type}-${block.title}`} style={styles.card}>
        <strong>{block.title}</strong>
        <ul>
          {(block.items || []).map((item) => (
            <li key={item.url || item.title}>
              <a href={item.url} target="_blank" rel="noreferrer">
                {item.title || item.url}
              </a>
              {item.summary ? ` — ${item.summary}` : ''}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (block.type === 'tool') {
    return (
      <div key={`${block.type}-${block.title}`} style={styles.card}>
        <strong>{block.title}</strong>
        <pre style={styles.codeBlock}>{JSON.stringify(block.content, null, 2)}</pre>
      </div>
    );
  }

  if (block.type === 'error') {
    return (
      <div key={`${block.type}-${block.title}`} style={styles.card}>
        <strong>{block.title}</strong>
        <p>{block.message}</p>
      </div>
    );
  }

  return (
    <div key={`${block.type}-${block.title}`} style={styles.card}>
      <strong>{block.title || 'Response'}</strong>
      <p>{block.content}</p>
    </div>
  );
}

export default function ChatHub({ assistantRuntime }) {
  const chat = assistantRuntime?.chatHub;
  const skills = useMemo(() => chat?.listSkills?.() || [], [chat]);
  const presets = useMemo(() => chat?.listPresets?.() || [], [chat]);

  const [prompt, setPrompt] = useState('');
  const [skillMode, setSkillMode] = useState('auto');
  const [manualSkill, setManualSkill] = useState(skills[0]?.id || 'project');
  const [multiSkills, setMultiSkills] = useState([]);
  const [presetId, setPresetId] = useState('');
  const [enableWebResearch, setEnableWebResearch] = useState(false);
  const [enableLongContext, setEnableLongContext] = useState(false);
  const [toolSelections, setToolSelections] = useState([]);
  const [sessionId, setSessionId] = useState('default');
  const [history, setHistory] = useState([]);
  const [latest, setLatest] = useState(null);
  const [openApiSettings, setOpenApiSettings] = useState(() => chat?.getOpenApiSettings?.() || {});
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!chat) {
    return <div style={styles.shell}>Chat hub runtime is not configured.</div>;
  }

  const toggleMultiSkill = (skillId) => {
    setMultiSkills((current) =>
      current.includes(skillId) ? current.filter((entry) => entry !== skillId) : [...current, skillId],
    );
  };

  const toggleTool = (toolName) => {
    setToolSelections((current) =>
      current.includes(toolName)
        ? current.filter((entry) => entry !== toolName)
        : [...current, toolName],
    );
  };

  const syncHistory = (targetSessionId) => {
    setHistory(chat.getSessionHistory(targetSessionId));
  };

  const handleSend = async () => {
    setError('');
    setIsSending(true);
    try {
      chat.startSession({ sessionId, longContext: enableLongContext });
      const result = await chat.sendMessage({
        sessionId,
        prompt,
        skillMode,
        manualSkill,
        multiSkills,
        presetId: presetId || undefined,
        webResearch: enableWebResearch,
        tools: toolSelections,
        longContext: enableLongContext,
      });

      setLatest(result);
      syncHistory(sessionId);
      setPrompt('');
    } catch (sendError) {
      setError(sendError.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  const handleRegenerate = async () => {
    setError('');
    setIsSending(true);
    try {
      const result = await chat.regenerateLast({
        sessionId,
        skillMode,
        manualSkill,
        multiSkills,
        presetId: presetId || undefined,
        webResearch: enableWebResearch,
        tools: toolSelections,
        longContext: enableLongContext,
      });
      setLatest(result);
      syncHistory(sessionId);
    } catch (regenerateError) {
      setError(regenerateError.message || 'Failed to regenerate response.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCompare = () => {
    setError('');
    try {
      if (!latest?.assistantMessage?.id) {
        return;
      }
      const comparison = chat.compareVersions({
        sessionId,
        assistantMessageId: latest.assistantMessage.id,
      });
      setLatest((current) => ({ ...current, comparison }));
    } catch (compareError) {
      setError(compareError.message || 'Failed to compare versions.');
    }
  };

  const handleSettingsUpdate = (patch) => {
    const updated = chat.updateOpenApiSettings(patch);
    setOpenApiSettings(updated);
  };

  return (
    <section style={styles.shell}>
      <div style={styles.card}>
        <h1 style={{ marginTop: 0 }}>Karma Chat Hub</h1>
        <p style={{ marginBottom: 0 }}>
          One ChatGPT-style interface for code, comics, image creation, artistic writing, and project execution.
        </p>
      </div>

      <div style={{ ...styles.card, ...styles.toolbar }}>
        <div>
          <strong>Session</strong>
          <input style={styles.input} value={sessionId} onChange={(event) => setSessionId(event.target.value)} />
        </div>
        <div>
          <strong>Skill Mode</strong>
          <select style={styles.input} value={skillMode} onChange={(event) => setSkillMode(event.target.value)}>
            <option value="auto">Auto</option>
            <option value="manual">Manual</option>
            <option value="multi">Multi-skill</option>
          </select>
        </div>
        <div>
          <strong>Prompt Preset</strong>
          <select style={styles.input} value={presetId} onChange={(event) => setPresetId(event.target.value)}>
            <option value="">None</option>
            {presets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {skillMode === 'manual' ? (
        <div style={styles.card}>
          <strong>Manual skill</strong>
          <SkillSelector skills={skills} value={manualSkill} onChange={setManualSkill} />
        </div>
      ) : null}

      {skillMode === 'multi' ? (
        <div style={styles.card}>
          <strong>Multi-skill selection</strong>
          <MultiSkillSelector
            skills={skills}
            selectedSkills={multiSkills}
            onToggle={toggleMultiSkill}
          />
        </div>
      ) : null}

      <div style={styles.card}>
        <strong>Power features</strong>
        <div style={styles.row}>
          <label>
            <input
              type="checkbox"
              checked={enableWebResearch}
              onChange={(event) => setEnableWebResearch(event.target.checked)}
            />{' '}
            Web/research mode
          </label>
          <label>
            <input
              type="checkbox"
              checked={enableLongContext}
              onChange={(event) => setEnableLongContext(event.target.checked)}
            />{' '}
            Long context session
          </label>
        </div>
        <div style={styles.row}>
          <label>
            <input
              type="checkbox"
              checked={toolSelections.includes('plugins.list')}
              onChange={() => toggleTool('plugins.list')}
            />{' '}
            plugins.list
          </label>
          <label>
            <input
              type="checkbox"
              checked={toolSelections.includes('memory.read')}
              onChange={() => toggleTool('memory.read')}
            />{' '}
            memory.read
          </label>
          <label>
            <input
              type="checkbox"
              checked={toolSelections.includes('references.search')}
              onChange={() => toggleTool('references.search')}
            />{' '}
            references.search
          </label>
        </div>
      </div>

      <div style={styles.card}>
        <strong>OpenAPI settings</strong>
        <div style={styles.toolbar}>
          <div>
            <label>API key</label>
            <input
              style={styles.input}
              type="password"
              value={openApiSettings.apiKey || ''}
              onChange={(event) => handleSettingsUpdate({ apiKey: event.target.value })}
            />
          </div>
          <div>
            <label>Provider</label>
            <input
              style={styles.input}
              value={openApiSettings.provider || ''}
              onChange={(event) => handleSettingsUpdate({ provider: event.target.value })}
            />
          </div>
          <div>
            <label>Model</label>
            <input
              style={styles.input}
              value={openApiSettings.model || ''}
              onChange={(event) => handleSettingsUpdate({ model: event.target.value })}
            />
          </div>
          <div>
            <label>Fallback model</label>
            <input
              style={styles.input}
              value={openApiSettings.fallbackModel || ''}
              onChange={(event) => handleSettingsUpdate({ fallbackModel: event.target.value })}
            />
          </div>
          <div>
            <label>Retries</label>
            <input
              style={styles.input}
              type="number"
              min={0}
              max={5}
              value={openApiSettings.retries ?? 1}
              onChange={(event) => handleSettingsUpdate({ retries: Number(event.target.value) })}
            />
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <textarea
          style={styles.textarea}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Ask for code, comics, images, writing, or project help..."
        />
        <div style={styles.row}>
          <button style={{ ...styles.button, ...styles.primaryButton }} type="button" onClick={handleSend} disabled={isSending}>
            {isSending ? 'Running...' : 'Send'}
          </button>
          <button style={styles.button} type="button" onClick={handleRegenerate} disabled={isSending}>
            Regenerate
          </button>
          <button style={styles.button} type="button" onClick={handleCompare}>
            Compare versions
          </button>
        </div>
        {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
      </div>

      <div style={styles.card}>
        <h2 style={{ marginTop: 0 }}>Conversation history</h2>
        {history.length === 0 ? <p>No messages yet.</p> : null}
        {history.map((message) => (
          <div
            key={message.id}
            style={{
              ...styles.card,
              ...(message.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant),
            }}
          >
            <strong>{message.role === 'user' ? 'You' : 'Karma'}</strong>
            <p>{message.content}</p>
            {message.role === 'assistant' && message.blocks ? message.blocks.map((block) => renderBlock(block)) : null}
          </div>
        ))}
      </div>

      {latest?.usage ? (
        <div style={styles.card}>
          <strong>Usage</strong>
          <p style={{ marginBottom: 0 }}>
            Provider: {latest.usage.provider} · Model: {latest.usage.model} · Tokens: {latest.usage.totalTokens}
          </p>
        </div>
      ) : null}

      {latest?.comparison ? (
        <div style={styles.card}>
          <strong>Version comparison</strong>
          <pre style={styles.codeBlock}>{JSON.stringify(latest.comparison, null, 2)}</pre>
        </div>
      ) : null}
    </section>
  );
}
