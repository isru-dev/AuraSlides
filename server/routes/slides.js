const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware'); // Import your middleware

// Put the "protect" middleware function right in the middle!
router.get('/my-slides', protect, async (req, res) => {
  try {
    // Because jwt.verify() worked, we can instantly access req.user!
    console.log(`Fetching slides for user ID: ${req.user.userId}`);

    // Query your MongoDB securely for only this user's data
    // const userSlides = await Slide.find({ user: req.user.userId });

    return res.status(200).json({
      success: true,
      message: "Here is your private data, completely protected by your token signature.",
      userId: req.user.userId
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
