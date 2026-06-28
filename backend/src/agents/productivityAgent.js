const { callLLM } = require('../llm/callLLM');

async function runProductivityAgent(commitMessage, author, timeOfDay, commitSize) {
  const systemPrompt = `You are an HR & Productivity Analyst. Look at the commit size, time of day, and message tone to assess burnout risk.
Output ONLY valid JSON in this exact format:
{
  "risk_level": "low|medium|high",
  "observation": "...",
  "tip": "..."
}`;

  const userPrompt = `Commit Details:
- Author: ${author}
- Message: ${commitMessage}
- Time of Day (UTC): ${timeOfDay}
- Files Changed: ${commitSize}

Analyze the burnout risk based on this.`;

  console.log(`[ProductivityAgent] Started analysis for ${author}...`);
  const result = await callLLM(systemPrompt, userPrompt);
  console.log(`[ProductivityAgent] Finished analysis.`);
  
  return result || { risk_level: 'low', observation: 'Normal activity', tip: 'Keep up the good work.' };
}

module.exports = { runProductivityAgent };
