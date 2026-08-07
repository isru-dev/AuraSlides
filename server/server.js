const express=require('express');
const cors = require("cors");
require("dotenv").config(); // Load environment keys first
const authRoutes = require("./routes/authRoutes");
const presentationRoutes=require('./routes/presentationRoutes.js')
const gogleauthRoutes=require('./routes/gogleauthRoutes.js');
const aiRoutes=require('./routes/aiRoutes.js');
const mongoose = require('mongoose');
const { connectDb } = require('./config/db.js');
const protect = require("./middleware/authMiddleware.js");

let app=express();
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://aura-slides.vercel.app", 
    ],
    credentials: true,
  })
);

const PORT=process.env.PORT || 5000;
app.use("/api/auth", authRoutes);
app.use("/api/presentation",presentationRoutes);
app.use("/api/auth/google",gogleauthRoutes);
app.use("/api/ai",aiRoutes);

app.post("/api/feedback", protect, async (req, res) => {
  const user_id = req.user.id;
  const { message, email, category } = req.body;

  try {
    const categoryEmoji =
      category === "bug"
        ? "🐛 Bug"
        : category === "feature"
        ? "💡 Idea"
        : "❤️ General";

    const telegramText = `
🚀 *New Feedback on AuraSlides!*

*Type:* ${categoryEmoji}

*Message:*
${message}

*User Email:* ${email || "Not provided"}

*User ID:* ${user_id}
`.trim();

    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: telegramText,
          parse_mode: "Markdown",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        success: false,
        message: "Failed to send Telegram message",
        error: data,
      });
    }

    res.status(200).json({
      success: true,
      message: "Feedback submitted successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Feedback not submitted",
    });
  }
});
connectDb();
app.listen(PORT,()=>{
  console.log("server running on port "+ PORT);
  
});
