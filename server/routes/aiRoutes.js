const express = require("express");
const router = express.Router();
const ai = require("../services/aiProvider");

// Helper function to fetch photo from Unsplash API
async function fetchImageUrl(keyword) {
  if (!keyword) return null;

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?page=1&per_page=1&query=${encodeURIComponent(keyword)}`,
      {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    // Return regular resolution URL from the first result
    return data.results[0]?.urls?.regular || null;
  } catch (error) {
    console.error("Unsplash fetch error:", error);
    return null;
  }
}

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
  - imageKeyword (1-3 relevant English keywords for finding a stock photo on Unsplash)

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
      ],
      "imageKeyword": "relevant keyword search"
    }
  ]
}
`;

    const text = await ai.generate(aiPrompt);
    let parsedResponse;

    try {
      parsedResponse = JSON.parse(text);
    } catch (err) {
      console.error("JSON Parse Error:", err);

      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON.",
        raw: text,
      });
    }

    // 📸 Fetch Unsplash image URLs for each slide concurrently
    if (parsedResponse.slides && Array.isArray(parsedResponse.slides)) {
      parsedResponse.slides = await Promise.all(
        parsedResponse.slides.map(async (slide) => {
          const imageUrl = await fetchImageUrl(slide.imageKeyword);
          return {
            ...slide,
            imageUrl: imageUrl, // Adds high-res image URL to the slide object
          };
        })
      );
    }

    return res.json({
      success: true,
      result: parsedResponse,
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