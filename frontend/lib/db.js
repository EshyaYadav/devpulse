const { createClient } = require('@libsql/client');

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
  }

  return createClient({ url, authToken });
}

// Function to initialize tables if they don't exist
// In production with Turso, you'd usually run migrations via CLI,
// but for this simple setup we can just try creating them if they don't exist.
async function initDb() {
  const db = getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      github_delivery_id TEXT UNIQUE,
      repo_name TEXT,
      commit_hash TEXT,
      commit_message TEXT,
      author TEXT,
      files_changed TEXT, -- JSON string
      diff TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  await db.execute(`
    CREATE TABLE IF NOT EXISTS agent_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER,
      agent_name TEXT,
      result TEXT, -- JSON string
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(event_id) REFERENCES events(id)
    );
  `);
}

module.exports = { getDb, initDb };
