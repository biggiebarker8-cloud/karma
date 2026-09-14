const DEFAULT_RETENTION_MS = {
  session: 24 * 60 * 60 * 1000,
  user: 30 * 24 * 60 * 60 * 1000,
  task: 7 * 24 * 60 * 60 * 1000,
};

export function createMemoryStore({ retentionMs = DEFAULT_RETENTION_MS, auditLogger } = {}) {
  const memory = {
    session: [],
    user: [],
    task: [],
  };

  function compact(scope) {
    const ttl = retentionMs[scope];
    if (!ttl) return;
    const threshold = Date.now() - ttl;
    memory[scope] = memory[scope].filter((entry) => entry.createdAt >= threshold);
  }

  return {
    write(scope, value) {
      if (!memory[scope]) throw new Error(`Unsupported memory scope: ${scope}`);
      compact(scope);
      const entry = { value, createdAt: Date.now() };
      memory[scope].push(entry);
      auditLogger?.log?.({ type: 'memory.write', scope });
      return entry;
    },
    read(scope) {
      if (!memory[scope]) throw new Error(`Unsupported memory scope: ${scope}`);
      compact(scope);
      return memory[scope].map((entry) => entry.value);
    },
    clear(scope) {
      if (!memory[scope]) throw new Error(`Unsupported memory scope: ${scope}`);
      memory[scope] = [];
      auditLogger?.log?.({ type: 'memory.clear', scope });
    },
  };
}

