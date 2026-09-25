export function createOauthTokenStore() {
  const tokens = new Map();

  return {
    set(provider, token, expiresAt) {
      tokens.set(provider, { token, expiresAt });
    },
    get(provider) {
      const entry = tokens.get(provider);
      if (!entry) return null;
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        tokens.delete(provider);
        return null;
      }
      return entry.token;
    },
    clear(provider) {
      tokens.delete(provider);
    },
  };
}

