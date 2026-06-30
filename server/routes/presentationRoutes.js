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
module.exports = router;
