const { createClient } = require('@libsql/client/web');

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.warn("DB init warning: Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  }

  return createClient({
    url: url || "libsql://dummy",
    authToken: authToken || "dummy",
  });
}

async function initDb() {
  const db = getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS activity (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      author TEXT NOT NULL,
      repo TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      metadata TEXT
    )
  `);
}

module.exports = { getDb, initDb };
