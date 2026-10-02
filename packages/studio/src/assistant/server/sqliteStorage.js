import { chmodSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const RETAIN_FOREVER = Object.freeze({
  session: Number.POSITIVE_INFINITY,
  user: Number.POSITIVE_INFINITY,
  task: Number.POSITIVE_INFINITY,
});

function transact(db, operation) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = operation();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function createAssistantSqliteStorage(databasePath, { auditLogger } = {}) {
  if (typeof databasePath !== 'string' || !databasePath.trim()) {
    throw new Error('A database path is required for durable assistant storage');
  }
  const path = resolve(databasePath);
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(path);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = FULL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS assistant_memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scope TEXT NOT NULL CHECK (scope IN ('session', 'user', 'task')),
      value_json TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS assistant_memory_scope_created
      ON assistant_memory(scope, created_at);
    CREATE TABLE IF NOT EXISTS assistant_approvals (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL CHECK (status IN ('pending', 'approved')),
      request_json TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS assistant_approvals_status_created
      ON assistant_approvals(status, created_at);
    CREATE TABLE IF NOT EXISTS assistant_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      csrf_token TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS assistant_sessions_expiry
      ON assistant_sessions(expires_at);
  `);
  chmodSync(path, 0o600);

  const insertMemory = db.prepare(
    'INSERT INTO assistant_memory(scope, value_json, created_at) VALUES (?, ?, ?)',
  );
  const readMemory = db.prepare(
    'SELECT value_json, created_at FROM assistant_memory WHERE scope = ? ORDER BY id',
  );
  const deleteMemory = db.prepare('DELETE FROM assistant_memory WHERE scope = ?');
  const putApproval = db.prepare(
    'INSERT INTO assistant_approvals(id, status, request_json, created_at) VALUES (?, ?, ?, ?)',
  );
  const selectPendingApprovals = db.prepare(
    "SELECT id, request_json FROM assistant_approvals WHERE status = 'pending' ORDER BY created_at",
  );
  const selectApproval = db.prepare(
    'SELECT request_json FROM assistant_approvals WHERE id = ? AND status = ?',
  );
  const deleteApproval = db.prepare('DELETE FROM assistant_approvals WHERE id = ?');
  const insertSession = db.prepare(
    'INSERT INTO assistant_sessions(id, user_id, csrf_token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)',
  );
  const getSession = db.prepare(
    'SELECT id, user_id, csrf_token, expires_at FROM assistant_sessions WHERE id = ?',
  );
  const removeSession = db.prepare('DELETE FROM assistant_sessions WHERE id = ?');
  const removeExpiredSessions = db.prepare('DELETE FROM assistant_sessions WHERE expires_at <= ?');

  const memoryStore = {
    write(scope, value) {
      if (!Object.hasOwn(RETAIN_FOREVER, scope)) {
        throw new Error(`Unsupported memory scope: ${scope}`);
      }
      const valueJson = JSON.stringify(value);
      if (typeof valueJson !== 'string') {
        throw new Error('Assistant memory values must be JSON-serializable');
      }
      const createdAt = Date.now();
      const result = insertMemory.run(scope, valueJson, createdAt);
      auditLogger?.log?.({ type: 'memory.write', scope });
      return { value, createdAt, id: Number(result.lastInsertRowid) };
    },
    read(scope) {
      if (!Object.hasOwn(RETAIN_FOREVER, scope)) {
        throw new Error(`Unsupported memory scope: ${scope}`);
      }
      return readMemory.all(scope).map((row) => JSON.parse(row.value_json));
    },
    clear(scope) {
      if (!Object.hasOwn(RETAIN_FOREVER, scope)) {
        throw new Error(`Unsupported memory scope: ${scope}`);
      }
      deleteMemory.run(scope);
      auditLogger?.log?.({ type: 'memory.clear', scope });
    },
  };

  const approvalStore = {
    listPending() {
      return selectPendingApprovals.all().map((row) => ({
        id: row.id,
        ...JSON.parse(row.request_json),
      }));
    },
    putPending(id, request) {
      putApproval.run(id, 'pending', JSON.stringify(request), Date.now());
    },
    moveToApproved(id) {
      return transact(db, () => {
        const row = selectApproval.get(id, 'pending');
        if (!row) return null;
        const request = JSON.parse(row.request_json);
        deleteApproval.run(id);
        putApproval.run(id, 'approved', JSON.stringify(request), Date.now());
        return request;
      });
    },
    consumeApproved(id, key) {
      if (typeof id !== 'string') return false;
      return transact(db, () => {
        const row = selectApproval.get(id, 'approved');
        if (!row || JSON.parse(row.request_json).key !== key) return false;
        deleteApproval.run(id);
        return true;
      });
    },
  };

  const sessionStore = {
    create(session) {
      insertSession.run(
        session.id,
        session.userId,
        session.csrfToken,
        session.expiresAt,
        Date.now(),
      );
    },
    get(id) {
      if (typeof id !== 'string') return null;
      removeExpiredSessions.run(Date.now());
      return getSession.get(id) ?? null;
    },
    delete(id) {
      if (typeof id === 'string') removeSession.run(id);
    },
  };

  return {
    memoryStore,
    approvalStore,
    sessionStore,
    close() {
      db.close();
    },
  };
}
