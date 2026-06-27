const express = require("express");
const router = express.Router();
const User = require("../models/authModels");
router.get("/reg", (req, res) => {
  res.send("yes sir");
});
router.get("/", (req, res) => {
  res.send("hello from /");
});
router.post("/register", async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    // Check if all fields are provided
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    // Check password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    // Simple email validation
    if (!email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address.",
      });
    }
    const newUser = await User.create({ email, password });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: "server error", err: err.message });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    // Simple email validation
    if (!email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address.",
      });
    }
    const findUser = await User.findOne({ email });
    if (!findUser) {
      return res.status(400).json({ success: false, message: "Invalid email or password." });
    }

    if ( password === findUser.password) {
      // res.redirect('');
      console.log("login successfully");
      res.status(200).json({ message: "login successfully." });
    }else{
      res.status(400).json({ message: "bad data"});

    }
  } catch (err) {
    res.status(500).json({ message: "server error", err: err.message });
  }
});
module.exports = router;
