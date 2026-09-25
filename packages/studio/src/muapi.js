import { resolveApiEndpoint } from './utils/apiResolver.js';

export function muapiFetch(path, options = {}) {
  const endpoint = resolveApiEndpoint(path);
  return fetch(endpoint, {
    credentials: 'include',
    ...options,
  });
}
