import { getDb, initDb } from '../../lib/db.js';
import { runSecurityAgent } from '../../lib/agents/securityAgent.js';
import { runArchitectureAgent } from '../../lib/agents/architectureAgent.js';
import { runProductivityAgent } from '../../lib/agents/productivityAgent.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Init DB tables (no-op if they already exist)
  try {
    await initDb();
  } catch (err) {
    console.error('DB init warning:', err.message);
  }

  const event = req.headers['x-github-event'];
  const deliveryId = req.headers['x-github-delivery'];

  if (event === 'ping') {
    return res.status(200).send('pong');
  }

  if (event !== 'push') {
    return res.status(200).send('Ignoring non-push event');
  }

  const payload = req.body;
  const repoName = payload.repository?.full_name || 'unknown/repo';
  const headCommit = payload.head_commit;

  if (!headCommit) {
    return res.status(200).send('No head commit found');
  }

  const author = headCommit.author?.name || 'unknown';
  const message = headCommit.message || '';
  const hash = headCommit.id || '';
  
  const added = headCommit.added || [];
  const modified = headCommit.modified || [];
  const removed = headCommit.removed || [];
  const filesChanged = [...added, ...modified, ...removed];
  const filesChangedCount = filesChanged.length;
  
  const diff = payload.simulated_diff || `Files added: ${added.join(', ')}\nFiles modified: ${modified.join(', ')}\nFiles removed: ${removed.join(', ')}`;

  console.log(`[Webhook] Processing push event from ${repoName} by ${author}`);

  const db = getDb();
  
  try {
    // 1. Insert Event
    const eventResult = await db.execute({
      sql: `INSERT INTO events (github_delivery_id, repo_name, commit_hash, commit_message, author, files_changed, diff)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        deliveryId || `simulated-${Date.now()}`,
        repoName,
        hash,
        message,
        author,
        JSON.stringify(filesChanged),
        diff
      ]
    });
    
    const eventId = Number(eventResult.lastInsertRowid);
    console.log(`[Webhook] Event saved with ID ${eventId}. Running 3 agents in parallel...`);

    // 2. Run all 3 Agents in Parallel (this is why no queue is needed!)
    const [securityResult, architectureResult, productivityResult] = await Promise.all([
      runSecurityAgent(diff),
      runArchitectureAgent(diff),
      runProductivityAgent(message, author, new Date().toISOString(), filesChangedCount)
    ]);

    // 3. Save all 3 Results at once
    await db.batch([
      {
        sql: `INSERT INTO agent_results (event_id, agent_name, result) VALUES (?, ?, ?)`,
        args: [eventId, 'security', JSON.stringify(securityResult)]
      },
      {
        sql: `INSERT INTO agent_results (event_id, agent_name, result) VALUES (?, ?, ?)`,
        args: [eventId, 'architecture', JSON.stringify(architectureResult)]
      },
      {
        sql: `INSERT INTO agent_results (event_id, agent_name, result) VALUES (?, ?, ?)`,
        args: [eventId, 'productivity', JSON.stringify(productivityResult)]
      }
    ]);
    
    console.log(`[Webhook] Done! Event ID ${eventId} fully processed.`);
    return res.status(200).json({ success: true, eventId });

  } catch (err) {
    if (err.message?.includes('UNIQUE constraint failed')) {
      console.log(`[Webhook] Duplicate delivery ID ignored.`);
      return res.status(200).send('Duplicate');
    }
    console.error(`[Webhook] Error:`, err);
    return res.status(500).json({ error: err.message });
  }
}
