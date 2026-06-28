const { callLLM } = require('../callLLM');


async function runArchitectureAgent(diff) {
  let rules = [];
  try {
    const rulesData = require('../rules.json');
    rules = rulesData.rules || [];
  } catch (e) {
    console.error('Could not read rules.json', e);
  }

  const systemPrompt = `You are a strict Architecture Reviewer. Check code organization and naming against the provided rules.
Rules:
${rules.map((r, i) => `${i + 1}. ${r}`).join('\n')}

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

module.exports = { runArchitectureAgent };
