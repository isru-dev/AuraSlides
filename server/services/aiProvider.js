const gemini = require("./geminiService");
const groq = require("./groqService");

async function generate(prompt) {
  let text;

  try {
    console.log("Using Gemini...");
    text = await gemini.generate(prompt);
  } catch (err) {
    console.error("Gemini failed:", err.message);

    if (
      err.status === 429 ||
      err.status === 500 ||
      err.status === 503
    ) {
      console.log("Switching to Groq...");
      text = await groq.generate(prompt);
    } else {
      throw err;
    }
  }

  return text
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();
}

module.exports = {
  generate,
};