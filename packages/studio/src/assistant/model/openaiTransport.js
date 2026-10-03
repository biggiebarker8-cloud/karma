const DEFAULT_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

export function createOpenAITransport({
  apiKey = process.env.OPENAI_API_KEY,
  fetchImpl = globalThis.fetch,
  endpoint = DEFAULT_ENDPOINT,
  timeoutMs = 30_000,
} = {}) {
  if (!apiKey) {
    throw new Error('OpenAI transport requires OPENAI_API_KEY');
  }
  if (typeof fetchImpl !== 'function') {
    throw new Error('OpenAI transport requires fetch');
  }

  return async function openAITransport({ model, prompt, jsonMode = false }) {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + apiKey,
        'content-type': 'application/json',
      },
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      throw new Error('OpenAI response did not contain non-empty message content');
    }
    return content;
  };
}
