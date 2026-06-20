const express = require("express");

const router = express.Router();

router.post("/register", (req, res) => {
  const { email, password, confirmPassword } = req.body;

  // Check if all fields are provided
  if (!email || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "All fields are required."
    });
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match."
    });
  }

  // Check password length
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters."
    });
  }

  // Simple email validation
  if (!email.includes("@")) {
    return res.status(400).json({
      success: false,
      message: "Invalid email address."
    });
  }

  // Everything is valid
  res.status(200).json({
    success: true,
    message: "Registration request received.",
    data: {
      email
    }
  });
});

module.exports = router;