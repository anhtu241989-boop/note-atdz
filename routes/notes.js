const express = require("express");
const router = express.Router();
const Note = require("../models/Note");

// Trang chủ: tạo note mới nếu chưa có
router.get("/", async (req, res) => {
  const note = new Note({ content: "Start typing..." });
  await note.save();
  res.redirect(`/note/${note._id}`);
});

// Lấy note theo ID
router.get("/note/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).send("Note not found");
    res.render("index", { note, noteId: note._id });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

// API: lưu note
router.post("/save/:id", async (req, res) => {
  try {
    const { content } = req.body;
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true }
    );
    res.json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
