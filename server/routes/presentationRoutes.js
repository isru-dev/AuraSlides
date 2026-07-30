const express = require("express");
const router = express.Router();
const ai = require("../services/aiProvider");
const PptxGenJS = require("pptxgenjs");
const Presentation = require("../models/presentationsModels.js");
const protect = require("../middleware/authMiddleware.js");
const upload = require("../middleware/upload");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");
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

    return data.results[0]?.urls?.regular || null;
  } catch (err) {
    console.error("Unsplash fetch error:", err);
    return null;
  }
}
router.post("/", protect, async (req, res) => {
  try {
    const { title, prompt, slides, themeColor } = req.body;

    const presentation = await Presentation.create({
      owner: req.user.id,
      title,
      prompt,
      slides,
      themeColor,
    });

    res.status(201).json({
      success: true,
      message: "Presentation created successfully.",
      presentation,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
router.get("/:id", protect, async (req, res) => {
  try {
    const presentation = await Presentation.findOne({
      _id: req.params.id, //presenation id
      owner: req.user.id, // person id
    });
    if (!presentation) {
      return res.status(404).json({
        success: false,
        message: "Presentation not found.",
      });
    }

    res.status(200).json({
      success: true,
      presentation,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const allPresentation = await Presentation.find({
      owner: req.user.id,
    }).sort({ createdAt: -1 });
    if (allPresentation.length === 0) {
      return res.status(200).json({
        success: true,
        presentations: [],
      });
    }

    res.status(200).json({
      success: true,
      presentations: allPresentation,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const { title, prompt, slides, themeColor } = req.body;
    const presentation = await Presentation.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user.id,
      },
      {
        title,
        prompt,
        slides,
        themeColor,
      },
      {
        new: true,
      },
    );

    if (!presentation) {
      return res.status(404).json({
        success: false,
        message: "Presentation not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Presentation updated successfully.",
      presentation,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
//:id ->id presention id  req.user.id ->the user id
router.delete("/:id", protect, async (req, res) => {
  try {
    const deletedPresentation = await Presentation.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });
    if (!deletedPresentation) {
      return res.status(404).json({
        success: false,
        message: "Presentation not found.",
      });
    }
    res.status(200).json({
      success: true,
      message: "Presentation deleted successfully.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.post("/:id/chat", protect, async (req, res) => {
  try {
    const { message } = req.body;
    const presentationId = req.params.id;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    const presentation = await Presentation.findOne({
      _id: presentationId,
      owner: req.user.id,
    });

    if (!presentation) {
      return res.status(404).json({
        success: false,
        message: "Presentation not found.",
      });
    }

    // 1. Save user's message
    presentation.messages.push({
      role: "user",
      content: message,
    });

    // 2. Updated Prompt: Ask AI to include imageKeyword
    const aiPrompt = `
You are an expert presentation assistant.

Current presentation:
Title: ${presentation.title}

Current Slides:
${JSON.stringify(presentation.slides, null, 2)}

Conversation History:
${presentation.messages.map((msg) => `${msg.role}:${msg.content}`).join("\n")}

User Request:
${message}

Update the presentation according to the user's request. Maintain relevant existing data where appropriate.
Provide an "imageKeyword" (1-3 English descriptive words for an image search) for each slide.

Return ONLY valid JSON with no markdown block markers (no codeblocks).

Format:
{
  "reply": "A friendly response explaining what was updated.",
  "slides": [
    {
      "slideNumber": 1,
      "title": "...",
      "content": ["...", "..."],
      "layoutType": "bullet-list",
      "imageKeyword": "relevant search phrase"
    }
  ]
}
`;

    const aiText = await ai.generate(aiPrompt);

    // Clean JSON markdown wrappers if AI adds them
    const cleanJson = aiText.replace(/```json|```/g, "").trim();

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanJson);
    } catch (err) {
      console.error("JSON Parse Error:", err);
      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON format.",
        raw: aiText,
      });
    }

    // Map existing slides for easy lookup to prevent refetching unchanged images
    const existingSlideMap = new Map();
    presentation.slides.forEach((s) => {
      existingSlideMap.set(s.slideNumber, s);
    });

    // 3. Process new slides & fetch Unsplash images
    const updatedSlides = await Promise.all(
      parsedResponse.slides.map(async (slide) => {
        const existingSlide = existingSlideMap.get(slide.slideNumber);

        // Reuse image if the imageKeyword hasn't changed
        if (
          existingSlide &&
          existingSlide.imageUrl &&
          existingSlide.imageKeyword === slide.imageKeyword
        ) {
          return {
            ...slide,
            imageUrl: existingSlide.imageUrl,
          };
        }

        // Fetch new image if imageKeyword changed or slide is new
        if (slide.imageKeyword) {
          try {
            const fetch = (await import("node-fetch")).default;
            const unsplashRes = await fetch(
              `https://api.unsplash.com/search/photos?page=1&query=${encodeURIComponent(
                slide.imageKeyword,
              )}&per_page=1&client_id=${process.env.UNSPLASH_ACCESS_KEY}`,
            );

            if (unsplashRes.ok) {
              const unsplashData = await unsplashRes.json();
              if (unsplashData.results && unsplashData.results.length > 0) {
                return {
                  ...slide,
                  imageUrl: unsplashData.results[0].urls.regular,
                };
              }
            }
          } catch (imgError) {
            console.error(
              "Failed to fetch image in chat route:",
              imgError.message,
            );
          }
        }

        return {
          ...slide,
          imageUrl: slide.imageUrl || null,
        };
      }),
    );

    // 4. Update presentation state
    presentation.slides = updatedSlides;

    presentation.messages.push({
      role: "assistant",
      content:
        parsedResponse.reply || "I've updated your presentation successfully.",
    });

    presentation.status = "completed";
    await presentation.save();

    return res.status(200).json({
      success: true,
      presentation,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.get("/:id/export", protect, async (req, res) => {
  try {
    const presentation = await Presentation.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!presentation) {
      return res.status(404).json({
        success: false,
        message: "Presentation not found.",
      });
    }

    const pptx = new PptxGenJS();
    // Add this helper function at the top of your export route file
    async function fetchImageAsBase64(url) {
      if (!url) return null;
      try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType =
          response.headers.get("content-type") || "image/jpeg";
        return `data:${contentType};base64,${buffer.toString("base64")}`;
      } catch (err) {
        console.error("Failed to convert image to base64:", err);
        return null;
      }
    }
    // Change forEach to a for...of loop to support await
    for (const slideData of presentation.slides) {
      const slide = pptx.addSlide();
      slide.background = { color: "050816" };

      // 1. Add Title
      slide.addText(slideData.title, {
        x: 0.5,
        y: 0.3,
        fontSize: 24,
        bold: true,
        color: "67E8F9",
        paraSpaceAfter: 12,
      });

      // 2. Pre-fetch image data if URL exists
      let base64Image = null;
      if (slideData.imageUrl) {
        base64Image = await fetchImageAsBase64(slideData.imageUrl);
      }

      const hasImage = Boolean(base64Image);
      const textWidth = hasImage ? 5.0 : 9.0;

      // 3. Add Bullet Points
      slide.addText(
        slideData.content.map((point) => ({
          text: point,
          options: {
            bullet: true,
            color: "FFFFFF",
            fontSize: 16,
            paraSpaceAfter: 12,
          },
        })),
        {
          x: 0.5,
          y: 1.7,
          w: textWidth,
        },
      );

      // 4. Embed Base64 Image
      if (hasImage) {
        slide.addImage({
          data: base64Image, // Use 'data' instead of 'path' for Base64 strings
          x: 5.8,
          y: 1.7,
          w: 3.7,
          h: 4.5,
          sizing: { type: "cover" },
        });
      }
    }

    const fileData = await pptx.write("nodebuffer");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${presentation.title}.pptx"`,
    );

    res.send(fileData);
  } catch (err) {
    console.error("Export error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.post("/document", upload.single("document"), async (req, res) => {
  try{
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  let extractedText = "";

  if (file.mimetype === "application/pdf") {
    const data = await pdf(file.buffer);

    extractedText = data.text;
  } else if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      buffer: file.buffer,
    });

    extractedText = result.value;
  } else {
    extractedText = file.buffer.toString("utf8");
  }
  console.log("Characters:", extractedText.length);
console.log("Words:", extractedText.split(/\s+/).length);
const MAX_CHARS = 12000;

const documentText =
  extractedText.length > MAX_CHARS
    ? extractedText.slice(0, MAX_CHARS)
    : extractedText;
  const aiPrompt = `
You are an expert presentation designer.
  
Read the following document.

Generate a professional presentation.
  Return ONLY valid JSON.

Format:

{
  "title": "Presentation Title",
  "slides": [
    {
      "slideNumber": 1,
      "title": "...",
      "content": [
        "...",
        "..."
      ],
      "imageKeyword": "..."
    }
  ]
}
Rules:

- exactly 5 slides
- concise bullet points
- preserve important facts
- imageKeyword for every slide
- return ONLY JSON
-- Return plain text only.
- Do NOT use Markdown.
- Do NOT use **bold**, *italic*, # headings, or bullet symbols.
- Each content item should be plain text.
Document:

${documentText}`
;

  const text = await ai.generate(aiPrompt);
     console.log(text);
  const parsedResponse = JSON.parse(text);
   console.log(parsedResponse);
   console.log(parsedResponse.slides);


  if (!parsedResponse.slides || !Array.isArray(parsedResponse.slides)) {
  return res.status(500).json({
    success: false,
    message: "AI did not return a valid slides array.",
    raw: parsedResponse,
  });
}

parsedResponse.slides = await Promise.all(
  parsedResponse.slides.map(async (slide) => {
    const imageUrl = await fetchImageUrl(slide.imageKeyword);

    return {
      ...slide,
      imageUrl,
    };
  })
);

  res.json({
    success: true,
    result: parsedResponse,
  });
   } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
