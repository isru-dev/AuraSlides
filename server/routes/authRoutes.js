const express = require("express");
const router = express.Router();
const User = require("../models/authModels");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const protect = require("../middleware/authMiddleware.js");


router.get("/reg", (req, res) => {
  res.send("yes sir");
});
router.get("/", (req, res) => {
  res.send("hello from /");
});
router.post("/register", async (req, res) => {
  try {
    const {name, email, password, confirmPassword } = req.body;
    // Check if all fields are provided
    if (!name ||!email  || !password || !confirmPassword) {
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
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name,email, password: hashedPassword });
    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: { id: newUser._id,name: newUser.name, email: newUser.email },
    });
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
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password." });
    }
    const isMatch = await bcrypt.compare(password, findUser.password);
    if (isMatch) {
      // 2. Create the JWT token
      const token = jwt.sign(
        { id: findUser._id, name: findUser.name,  email: findUser.email }, // Payload: Data to hide in the token
        process.env.JWT_SECRET,
        { expiresIn: "1h" }, // Options: Token expires in 1 hour
      );
        
      // 3. Send the token back to React
      return res.status(200).json({
        success: true,
        message: "Login successful.",
        token: token, // Send this string to the frontend
        user: { id: findUser._id, name: findUser.name, email: findUser.email }
      });
    } else {
      return res.status(400).json({ message: "Invalid credentials." });
    } /*
    if (isMatch) {
      console.log("login successfully");
      res.status(200).json({ message: "login successfully." });
    } else {
      res.status(400).json({ message: "bad data" });
    }*/
  } catch (err) {
    res.status(500).json({ message: "server error", err: err.message });
  }
});
router.get("/me", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,      // ← ADD THIS LINE
        email: user.email,
      }
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(400).json({ 
      success: false, 
      message: "Failed to fetch user" 
    });
  }
});

module.exports = router;
