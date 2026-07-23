const gemini = require("./geminiService");
const groq = require("./groqService");

async function generate(prompt) {
  try {
    console.log("Using Gemini...");
    return await gemini.generate(prompt);
  } catch (err) {
    console.error("Gemini Error:", err.message);

    // Fallback on rate limit
    if (err.status === 429) {
      console.log("Switching to Groq...");
      return await groq.generate(prompt);
    }

    throw err;
  }
}

module.exports = {
  generate,
};