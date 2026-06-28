const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../devpulse.db');
const db = new Database(dbPath);

function initDb() {
  db.exec(`
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

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER,
      status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(event_id) REFERENCES events(id)
    );

    CREATE TABLE IF NOT EXISTS agent_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER,
      agent_name TEXT,
      result TEXT, -- JSON string
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(job_id) REFERENCES jobs(id)
    );
  `);
  console.log('Database schema initialized.');
}

module.exports = { db, initDb };
