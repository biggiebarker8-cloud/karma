const DEFAULT_ENDPOINT = 'https://api.anthropic.com/v1/messages';

export function createClaudeTransport({
  apiKey = process.env.ANTHROPIC_API_KEY,
  fetchImpl = globalThis.fetch,
  endpoint = DEFAULT_ENDPOINT,
  timeoutMs = 30_000,
} = {}) {
  if (!apiKey) {
    throw new Error('Claude transport requires ANTHROPIC_API_KEY');
  }
  if (typeof fetchImpl !== 'function') {
    throw new Error('Claude transport requires fetch');
  }

  return async function claudeTransport({ model, prompt, jsonMode = false }) {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'x-api-key': apiKey,
      },
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: jsonMode ? `${prompt}\nReturn valid JSON only.` : prompt,
        }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const content = Array.isArray(payload?.content)
      ? payload.content
        .filter((block) => typeof block?.text === 'string')
        .map((block) => block.text)
        .join('')
      : '';
    if (!content.trim()) {
      throw new Error('Claude response did not contain non-empty message content');
    }
    return content;
  };
}
