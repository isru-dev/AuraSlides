const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const { OAuth2Client } = require('google-auth-library'); 
const User = require('../models/authModels.js');

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'postmessage'
);
router.post("/", async (req, res) => {
  // 2. Expect "code" from the body payload instead of "token"
  const { code } = req.body;

  try {
    // 3. Trade the authorization code for real token payloads
    const { tokens } = await client.getToken({
      code: code,
  
      redirect_uri: 'postmessage' // Vital flag matching the popup source execution context
    });

    // 4. Verify the id_token that Google returned in the token swap bundle
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token, // Look inside the fresh tokens object
      audience: process.env.GOOGLE_CLIENT_ID, 
    });

    const { name, email } = ticket.getPayload();

    // Check if user exists, or create a brand new one instantly
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: Math.random().toString(36).slice(-8) + Date.now().toString(),
      });
    }

    // Issue your native application JWT token
    const appToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      success: true,
      token: appToken,
    });

  } catch (error) {
    console.error("Google Auth Backend Error:", error); // Added error logging to your terminal for sanity checks
    return res.status(400).json({ success: false, message: "Google authentication failed" });
  }
});
module.exports = router;
