const { getDb } = require('../lib/db.js');

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { since } = req.query;

  try {
    const db = getDb();
    let query = "SELECT * FROM activity ORDER BY timestamp DESC LIMIT 50";
    let args = [];

    if (since) {
      query = "SELECT * FROM activity WHERE timestamp > ? ORDER BY timestamp DESC LIMIT 50";
      args = [since];
    }

    const result = await db.execute({ sql: query, args });
    
    const activities = result.rows.map(row => ({
      id: row.id,
      type: row.type,
      description: row.description,
      author: row.author,
      repo: row.repo,
      timestamp: row.timestamp,
      metadata: row.metadata ? JSON.parse(row.metadata) : null
    }));

    res.status(200).json({ activities });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = handler;
