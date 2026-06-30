const mongoose = require("mongoose");

const presentationsSchema  = new mongoose.Schema(
  {
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

const Presentation = mongoose.model("Presentation", presentationsSchema);

module.exports = Presentation;