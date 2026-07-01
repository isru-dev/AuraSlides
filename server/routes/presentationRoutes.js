const express = require("express");
const router = express.Router();

const Presentation = require("../models/presentationsModels.js");
const protect = require("../middleware/authMiddleware.js");

router.post("/", protect, async (req, res) => {
  try {
    const { title, prompt, slides, themeColor } = req.body;

    const presentation = await Presentation.create({
      owner: req.user.userId,
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
      _id: req.params.id,
      owner: req.user.userId,
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
      owner: req.user.userId,
    });
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
        owner: req.user.userId,
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
      owner: req.user.userId,
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
module.exports = router;
