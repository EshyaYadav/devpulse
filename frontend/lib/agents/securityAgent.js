import { callLLM } from '../callLLM.js';

export async function runSecurityAgent(diff) {
  const systemPrompt = `You are a strict Security Sentinel. Analyze the provided git diff for secrets, hardcoded API keys, passwords, and SQLi/XSS-prone patterns. 
Output ONLY valid JSON in this exact format:
{
  "severity": "low|medium|high|critical",
  "issues": [ { "type": "...", "description": "...", "file": "..." } ],
  "recommendation": "..."
}
If no issues are found, set severity to "low" and issues to [].`;

  const userPrompt = `Here is the diff to analyze:\n\n${diff}`;

  console.log(`[SecurityAgent] Started analysis...`);
  const result = await callLLM(systemPrompt, userPrompt);
  console.log(`[SecurityAgent] Finished analysis.`);
  
  return result || { severity: 'low', issues: [], recommendation: 'Failed to analyze.' };
}
