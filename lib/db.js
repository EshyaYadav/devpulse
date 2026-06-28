import { createClient } from '@libsql/client/web';

export function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
  }

  return createClient({ url, authToken });
}

export async function initDb() {
  const db = getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      github_delivery_id TEXT UNIQUE,
      repo_name TEXT,
      commit_hash TEXT,
      commit_message TEXT,
      author TEXT,
      files_changed TEXT,
      diff TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  await db.execute(`
    CREATE TABLE IF NOT EXISTS agent_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER,
      agent_name TEXT,
      result TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(event_id) REFERENCES events(id)
    )
  `);
}
