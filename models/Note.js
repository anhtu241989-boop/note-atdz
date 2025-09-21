const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("Note", noteSchema);
