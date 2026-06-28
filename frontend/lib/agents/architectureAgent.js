const { callLLM } = require('../callLLM.js');

async function runArchitectureAgent(diff) {
  const systemPrompt = `You are a strict Architecture Sentinel. Analyze the provided git diff for architectural violations, such as direct DB calls from UI, bypassing service layers, or monolithic anti-patterns.
Output ONLY valid JSON in this exact format:
{
  "severity": "low|medium|high|critical",
  "issues": [ { "type": "...", "description": "...", "file": "..." } ],
  "recommendation": "..."
}
If no issues are found, set severity to "low" and issues to [].`;

  const userPrompt = `Here is the diff to analyze:\n\n${diff}`;
  const result = await callLLM(systemPrompt, userPrompt);
  return result || { severity: 'low', issues: [], recommendation: 'Failed to analyze.' };
}

module.exports = { runArchitectureAgent };
