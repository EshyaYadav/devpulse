import { callLLM } from '../callLLM.js';

const rules = {
  rules: [
    "Files should be modular and not exceed 500 lines of code.",
    "Variable and function names should be descriptive and use camelCase.",
    "Ensure proper error handling with try-catch blocks.",
    "Avoid deep nesting (more than 3 levels).",
    "Keep functions focused on a single responsibility."
  ]
};


export async function runArchitectureAgent(diff) {
  const ruleList = rules.rules || [];

  const systemPrompt = `You are a strict Architecture Reviewer. Check code organization and naming against the provided rules.
Rules:
${ruleList.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Output ONLY valid JSON in this exact format:
{
  "compliance_score": 0-100,
  "violations": [ { "rule": "...", "description": "...", "file": "..." } ],
  "suggestion": "..."
}
If no issues, set score to 100 and violations to [].`;

  const userPrompt = `Here is the diff to analyze:\n\n${diff}`;

  console.log(`[ArchitectureAgent] Started analysis...`);
  const result = await callLLM(systemPrompt, userPrompt);
  console.log(`[ArchitectureAgent] Finished analysis.`);
  
  return result || { compliance_score: 100, violations: [], suggestion: 'Failed to analyze.' };
}
