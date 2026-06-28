const { GoogleGenerativeAI } = require('@google/generative-ai');

async function callLLM(systemInstruction, prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Missing GEMINI_API_KEY");
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction
    });

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    return JSON.parse(text);
  } catch (err) {
    console.error("LLM Error:", err.message);
    return null;
  }
}

module.exports = { callLLM };
