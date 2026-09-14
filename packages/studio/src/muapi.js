import { resolveApiEndpoint } from './utils/apiResolver';

export function muapiFetch(path, options = {}) {
  const endpoint = resolveApiEndpoint(path);
  return fetch(endpoint, {
    credentials: 'include',
    ...options,
  });
}
