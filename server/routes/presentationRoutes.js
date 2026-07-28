const express = require("express");
const router = express.Router();
const ai = require("../services/aiProvider");
const PptxGenJS = require("pptxgenjs");
const Presentation = require("../models/presentationsModels.js");
const protect = require("../middleware/authMiddleware.js");

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
    console.log("Presentation ID:", presentationId);
    console.log("User ID:", req.user.id);
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

    // Save user's message immediately
    presentation.messages.push({
      role: "user",
      content: message,
    });

    const aiPrompt = `
You are an expert presentation assistant.

Current presentation:

Title:
${presentation.title}

Current Slides:
${JSON.stringify(presentation.slides, null, 2)}

Conversation History:
${presentation.messages.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}

User Request:
${message}

Update the presentation according to the user's request.

Return ONLY valid JSON.

Format:

{
  "reply": "A friendly response to the user explaining what you changed.",
  "slides": [
    {
      "slideNumber": 1,
      "title": "...",
      "content": [
        "...",
        "..."
      ],
      "layoutType": "bullet-list"
    }
  ]
}
`;
    console.log("Sending request to AI Provider...");

    const aiText = await ai.generate(aiPrompt);

    console.log("Raw AI response:");
    console.log(aiText);

    let parsedResponse;

    try {
      parsedResponse = JSON.parse(aiText);
    } catch (err) {
      console.error("JSON Parse Error:", err);

      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON.",
        raw: aiText,
      });
    }

    // Update slides
    presentation.slides = parsedResponse.slides;

    // Save assistant reply
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
module.exports = router;
