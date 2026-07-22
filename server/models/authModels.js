const mongoose = require("mongoose");

const userSchema  = new mongoose.Schema(
  {
    name: {                    // ← ADD THIS
      type: String,
      required: false,         // Optional for existing users
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;