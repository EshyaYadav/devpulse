const { getDb } = require('../lib/db');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const since = req.query.since || '1970-01-01T00:00:00Z';

  try {
    const db = getDb();
    
    // Fetch events created after the `since` timestamp
    const eventsResult = await db.execute({
      sql: `SELECT * FROM events WHERE created_at > ? ORDER BY created_at DESC LIMIT 50`,
      args: [since]
    });

    if (eventsResult.rows.length === 0) {
      return res.status(200).json([]);
    }

    // Fetch corresponding agent results
    const eventIds = eventsResult.rows.map(row => row.id);
    const placeholders = eventIds.map(() => '?').join(',');
    
    const resultsData = await db.execute({
      sql: `SELECT * FROM agent_results WHERE event_id IN (${placeholders})`,
      args: eventIds
    });

    // Group results by event_id
    const resultsByEvent = {};
    for (const row of resultsData.rows) {
      if (!resultsByEvent[row.event_id]) {
        resultsByEvent[row.event_id] = {};
      }
      try {
        resultsByEvent[row.event_id][row.agent_name] = JSON.parse(row.result);
      } catch (e) {
        // invalid JSON
      }
    }

    // Format output exactly like the old socket payload
    const payload = eventsResult.rows.map(row => {
      let filesCount = 0;
      try { filesCount = JSON.parse(row.files_changed || '[]').length; } catch(e){}

      return {
        event: {
          id: row.id,
          repo: row.repo_name,
          author: row.author,
          message: row.commit_message,
          files_count: filesCount,
          created_at: row.created_at
        },
        results: resultsByEvent[row.id] || {
          security: null, architecture: null, productivity: null
        }
      };
    });

    return res.status(200).json(payload);

  } catch (err) {
    // If table doesn't exist yet, just return empty
    if (err.message.includes('no such table')) {
      return res.status(200).json([]);
    }
    console.error(`[Activity API] Error:`, err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
