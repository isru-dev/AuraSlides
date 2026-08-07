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
    isVerified: {
    type: Boolean,
    default: false,
    },
   verificationToken: {
    type: String,
    default: null,
  },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;