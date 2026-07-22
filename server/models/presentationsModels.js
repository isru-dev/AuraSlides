const mongoose = require("mongoose");

const presentationsSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
          type: [String],
          default: [],
        },
        layoutType: {
          type: String,
          enum: ["title-only", "split-screen", "bullet-list", "minimalist"],
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
    },

    themeColor: {
      type: String,
      default: "#06B6D4",
    },

    // ← NEW: Chat history
    messages: [
      {
        role: {
          type: String,
          enum: ["user", "assistant"],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Presentation = mongoose.model("Presentation", presentationsSchema);

module.exports = Presentation;