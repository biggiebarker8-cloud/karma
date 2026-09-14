import { resolveApiEndpoint } from './apiResolver';

export async function getMuapiPriceMap() {
  const endpoint = resolveApiEndpoint('/api/app/get_homepage_models');
  const response = await fetch(endpoint, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to load pricing (${response.status})`);
  }

  return response.json();
}
