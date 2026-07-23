const genAI = require("../config/gemini");

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

async function generate(prompt) {
  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = {
  generate,
};