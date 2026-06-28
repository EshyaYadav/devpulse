const { db } = require('../db/schema');
const { runSecurityAgent } = require('../agents/securityAgent');
const { runArchitectureAgent } = require('../agents/architectureAgent');
const { runProductivityAgent } = require('../agents/productivityAgent');
const { getIo } = require('../sockets');

function startWorker() {
  console.log('Starting polling queue worker (every 2s)...');

  setInterval(async () => {
    // Pick oldest pending job
    const job = db.prepare(`SELECT * FROM jobs WHERE status = 'pending' ORDER BY created_at ASC LIMIT 1`).get();
    if (!job) return;

    console.log(`[Worker] Picked up job ID: ${job.id}`);
    
    // Mark as processing
    db.prepare(`UPDATE jobs SET status = 'processing', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(job.id);

    try {
      // Get associated event
      const event = db.prepare(`SELECT * FROM events WHERE id = ?`).get(job.event_id);
      
      const filesChangedCount = JSON.parse(event.files_changed || '[]').length;
      
      console.log(`[Worker] Running 3 agents in parallel for job ID: ${job.id}`);
      
      const [securityResult, architectureResult, productivityResult] = await Promise.all([
        runSecurityAgent(event.diff),
        runArchitectureAgent(event.diff),
        runProductivityAgent(event.commit_message, event.author, event.created_at, filesChangedCount)
      ]);

      // Save results
      const insertResult = db.prepare(`INSERT INTO agent_results (job_id, agent_name, result) VALUES (?, ?, ?)`);
      insertResult.run(job.id, 'security', JSON.stringify(securityResult));
      insertResult.run(job.id, 'architecture', JSON.stringify(architectureResult));
      insertResult.run(job.id, 'productivity', JSON.stringify(productivityResult));

      // Mark done
      db.prepare(`UPDATE jobs SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(job.id);
      console.log(`[Worker] Job ID: ${job.id} completed. Emitting socket event.`);

      // Emit socket event
      const io = getIo();
      if (io) {
        io.emit('new_analysis', {
          event: {
            id: event.id,
            repo: event.repo_name,
            author: event.author,
            message: event.commit_message,
            files_count: filesChangedCount
          },
          results: {
            security: securityResult,
            architecture: architectureResult,
            productivity: productivityResult
          }
        });
      }

    } catch (error) {
      console.error(`[Worker] Job ID: ${job.id} failed:`, error);
      db.prepare(`UPDATE jobs SET status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(job.id);
    }

  }, 2000);
}

module.exports = { startWorker };
