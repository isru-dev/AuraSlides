const express = require("express");
const router = express.Router();
const ai = require("../config/gemini");


router.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required.",
      });
    }

    const aiPrompt = `
You are an expert presentation designer.

Create a presentation about:

"${prompt}"

Rules:

- Generate exactly 5 slides.
Return ONLY raw JSON.

Do NOT include:

- markdown
- explanation
- comments
- code fences
- introductory text
- trailing text

The response must begin with {
and end with }.
- Do not use markdown.
- Do not wrap the JSON inside \`\`\`.
- Each slide must have:
  - slideNumber
  - title
  - content (array of bullet points)

Return this exact format:

{
  "title": "Presentation Title",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Slide title",
      "content": [
        "Point 1",
        "Point 2",
        "Point 3"
      ]
    }
  ]
}
`;

    console.log("Sending to Gemini...");
         
    const result = await ai.generateContent(aiPrompt);

    const text = result.response.text();

    console.log(text);

    return res.json({
      success: true,
      result: text,
    });
  } catch (err) {
    console.error("Generate error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
