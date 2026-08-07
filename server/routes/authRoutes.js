const express = require("express");
const router = express.Router();
const User = require("../models/authModels");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const protect = require("../middleware/authMiddleware.js");
const resend=require('../config/resend.js')
const crypto = require("crypto");


router.get("/verify/:token", async (req, res) => {
  try {
    console.log("1. Verify route hit");

    const { token } = req.params;
    console.log("2. Token:", token);

    const user = await User.findOne({
      verificationToken:token.trim(),
    });

    console.log("3. User found:", user);

    if (!user) {
      console.log("4. No user found");

      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification link.",
      });
    }

    console.log("5. Updating user");

    user.isVerified = true;
    user.verificationToken = null;

    console.log("6. Before save:", user);

    await user.save();

    console.log("7. User saved successfully");

    return res.json({
      success: true,
      message: "Email verified successfully.",
    });

  } catch (err) {
    console.error("VERIFY ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Check required fields
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Existing email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }

    // Passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    // Password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    if (!email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Invalid email.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Save user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      isVerified: false,
    });
    
    console.log(newUser);
    
  
    await resend.emails.send({
      from: "AuraSlides <onboarding@resend.dev>",
      to: email,
      subject: "Verify your AuraSlides account",
      html: `
        <h2>Welcome to AuraSlides</h2>

        <p>Please verify your email before logging in.</p>

        <a href="${process.env.FRONTEND_URL}/verify/${verificationToken}">
          Verify Email
        </a>
      `,
    });
 
    return res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email to verify your account.",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
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

    const findUser = await User.findOne({ email });

    if (!findUser) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      findUser.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Email verification check
    if (!findUser.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }

    const token = jwt.sign(
      {
        id: findUser._id,
        name: findUser.name,
        email: findUser.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: findUser._id,
        name: findUser.name,
        email: findUser.email,
      },
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });

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

router.patch("/fix-names", async (req, res) => {
  try {
    const result = await User.updateMany(
      { name: null },
      { $set: { name: "User" } }
    );
    res.json({ 
      success: true,
      message: "Fixed names",
      updatedCount: result.modifiedCount  // How many users were updated
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fixing names",
      error: error.message 
    });
  }
});

module.exports = router;
