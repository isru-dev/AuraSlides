const mongoose = require("mongoose");

const presentationsSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References your user model file name
      required: true,
    },

    title: {
      type: String,
      required: [true, "A presentation title is required."],
      trim: true,
      maxlength: 100,
    },
    slides: [
      {
        slideNumber: {
          type: Number,
          required: true,
        },
        title: {
          type: String,
          default: "Untitled Slide",
        },
        content: {
          type: [String], // Array of bullet points or text blocks
          default: [],
        },
        layoutType: {
          type: String,
          enum: ["title-only", "split-screen", "bullet-list", "minimalist"], // Matches layout options
          default: "bullet-list",
        },
      },
    ],
    prompt: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "generating", "completed", "failed"],
      default: "pending",
    }, // 4. DESIGN PREFERENCES
    themeColor: {
      type: String,
      default: "#06B6D4", // Default AuraSlides cyan color accent
    }
  },
  {
    timestamps: true,
  }
);

const Presentation = mongoose.model("Presentation", presentationsSchema);

module.exports = Presentation;
