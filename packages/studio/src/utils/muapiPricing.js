import { resolveApiEndpoint } from './apiResolver.js';

const PRICING_RETRY_DELAYS_MS = [250, 750];

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      signal?.removeEventListener?.('abort', onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timeoutId);
      reject(new DOMException('Request aborted', 'AbortError'));
    };

    if (signal?.aborted) {
      onAbort();
      return;
    }

    signal?.addEventListener?.('abort', onAbort, { once: true });
  });
}

export async function getMuapiPriceMap({ signal } = {}) {
  const endpoint = resolveApiEndpoint('/api/app/get_homepage_models');
  let lastError;

  for (let attempt = 0; attempt <= PRICING_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
        signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to load pricing (${response.status})`);
      }

      return response.json();
    } catch (error) {
      lastError = error;
      if (error?.name === 'AbortError') {
        throw error;
      }
      if (attempt < PRICING_RETRY_DELAYS_MS.length) {
        await wait(PRICING_RETRY_DELAYS_MS[attempt], signal);
      }
    }
  }

  const errorMessage =
    lastError instanceof Error ? lastError.message : 'Failed to load pricing';
  throw new Error(`${errorMessage}. Please try again.`);
}
