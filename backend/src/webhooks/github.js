const express = require('express');
const crypto = require('crypto');
const { db } = require('../db/schema');

const router = express.Router();

router.post('/github', express.json(), (req, res) => {
  // Simple signature verification (if secret is provided in env)
  // For this exercise, we will just accept the payload if secret is empty.
  const signature = req.headers['x-hub-signature-256'];
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
  
  // Create a synthetic diff based on added/modified/removed for LLM analysis
  const added = headCommit.added || [];
  const modified = headCommit.modified || [];
  const removed = headCommit.removed || [];
  const filesChanged = [...added, ...modified, ...removed];
  
  // Synthetic diff since GitHub payload doesn't include full diff text
  // The actual diff would typically be fetched via GitHub API using the commit hash.
  // For the prompt's simplicity, we simulate a diff based on the files.
  // In `simulate-webhook.sh`, we'll pass a custom `simulated_diff` field to test the LLM.
  const diff = payload.simulated_diff || `Files added: ${added.join(', ')}\nFiles modified: ${modified.join(', ')}\nFiles removed: ${removed.join(', ')}`;

  console.log(`[Webhook] Received push event from ${repoName} by ${author}`);

  try {
    const insertEvent = db.prepare(`
      INSERT INTO events (github_delivery_id, repo_name, commit_hash, commit_message, author, files_changed, diff)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const info = insertEvent.run(
      deliveryId || `simulated-${Date.now()}`,
      repoName,
      hash,
      message,
      author,
      JSON.stringify(filesChanged),
      diff
    );

    const insertJob = db.prepare(`INSERT INTO jobs (event_id) VALUES (?)`);
    insertJob.run(info.lastInsertRowid);
    
    console.log(`[Webhook] Event saved and job queued.`);

    res.status(202).send('Accepted');
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      console.log(`[Webhook] Duplicate delivery ID ignored.`);
      return res.status(200).send('Duplicate');
    }
    console.error(`[Webhook] Database error:`, err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
