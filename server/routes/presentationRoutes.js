const express = require("express");
const router = express.Router();
const ai = require("../config/gemini");

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

    const presentation = await Presentation.findOne({
      _id: presentationId,
      owner: req.user.id,
    });

    if (!presentation) {
      return res.status(404).json({
        success: false,
        message: "Presentation not found",
      });
    }

    console.log("User message:", message);

    const aiPrompt = `
You are a presentation designer.

Current slides:
${JSON.stringify(presentation.slides, null, 2)}

User request: "${message}"

Update the slides based on the request. Return ONLY valid JSON with updated slides.
Format:
{
  "slides": [
    {
      "slideNumber": 1,
      "title": "...",
      "content": ["...", "..."]
    }
  ]
}
`;

    console.log("Sending to Gemini...");

    const result = await ai.generateContent(aiPrompt);

    const aiText = result.response.text();

    console.log(aiText);
    console.log("Gemini response:", aiText);
      
    let parsedResponse;

try {
  const cleanText = aiText
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  parsedResponse = JSON.parse(cleanText);
} catch (err) {
  console.error("Raw AI response:");
  console.error(aiText);

  console.error("JSON parse error:");
  console.error(err);

  return res.status(500).json({
    success: false,
    message: "Gemini returned invalid JSON",
    raw: aiText,
  });
}

    presentation.slides = parsedResponse.slides;

    presentation.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });
    presentation.messages.push({
      role: "assistant",
      content: aiText,
      timestamp: new Date(),
    });

    await presentation.save();

    return res.json({
      success: true,
      presentation,
    });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
module.exports = router;
