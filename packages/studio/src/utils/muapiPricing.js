import { resolveApiEndpoint } from './apiResolver';

const PRICING_RETRY_DELAYS_MS = [250, 750];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getMuapiPriceMap() {
  const endpoint = resolveApiEndpoint('/api/app/get_homepage_models');
  let lastError;

  for (let attempt = 0; attempt <= PRICING_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to load pricing (${response.status})`);
      }

      return response.json();
    } catch (error) {
      lastError = error;
      if (attempt < PRICING_RETRY_DELAYS_MS.length) {
        await wait(PRICING_RETRY_DELAYS_MS[attempt]);
      }
    }
  }

  const errorMessage =
    lastError instanceof Error ? lastError.message : 'Failed to load pricing';
  throw new Error(`${errorMessage}. Please try again.`);
}
