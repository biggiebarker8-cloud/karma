export function createRateLimiter({ intervalMs = 60_000, maxActions = 30 } = {}) {
  const usage = new Map();

  return {
    canProceed(scope) {
      const now = Date.now();
      const current = usage.get(scope);

      if (!current || now >= current.resetAt) {
        usage.set(scope, { count: 1, resetAt: now + intervalMs });
        return true;
      }

      if (current.count >= maxActions) {
        return false;
      }

      current.count += 1;
      return true;
    },
  };
}

