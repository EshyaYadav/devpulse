const { getDb, initDb } = require('../../lib/db.js');
const { runSecurityAgent } = require('../../lib/agents/securityAgent.js');
const { runArchitectureAgent } = require('../../lib/agents/architectureAgent.js');
const { runProductivityAgent } = require('../../lib/agents/productivityAgent.js');

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const githubEvent = req.headers['x-github-event'];
  const deliveryId = req.headers['x-github-delivery'];

  if (githubEvent !== 'push') {
    return res.status(200).json({ message: 'Event ignored' });
  }

  const payload = req.body;
  
  if (!payload || !payload.repository || !payload.head_commit) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const repoName = payload.repository.full_name;
  const commit = payload.head_commit;
  const author = commit.author ? commit.author.name : 'Unknown';
  
  console.log(`[Webhook] Processing push event from ${repoName} by ${author}`);

  try {
    const diffText = payload.simulated_diff || `Files changed: ${commit.added.concat(commit.modified).join(', ')}`;
    
    const [security, architecture, productivity] = await Promise.all([
      runSecurityAgent(diffText).catch(e => { console.error('SecAgent Error', e); return null; }),
      runArchitectureAgent(diffText).catch(e => { console.error('ArchAgent Error', e); return null; }),
      runProductivityAgent(diffText).catch(e => { console.error('ProdAgent Error', e); return null; })
    ]);

    const metadata = JSON.stringify({
      security,
      architecture,
      productivity,
      files: {
        added: commit.added,
        modified: commit.modified,
        removed: commit.removed
      }
    });

    try {
      await initDb();
    } catch (e) {
      console.warn("Could not init DB, maybe already inited?", e.message);
    }

    const db = getDb();
    
    await db.execute({
      sql: `INSERT INTO activity (id, type, description, author, repo, metadata) 
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        deliveryId || Date.now().toString(),
        'push',
        commit.message,
        author,
        repoName,
        metadata
      ]
    });

    res.status(200).json({ success: true, message: 'Processed successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = handler;
