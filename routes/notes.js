const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

let notes = [];

// Tạo note mới
router.post("/", (req, res) => {
  const { title, content } = req.body;
  const newNote = { id: uuidv4(), title, content };
  notes.push(newNote);
  res.json(newNote);
});

// Lấy note theo uuid
router.get("/:id", (req, res) => {
  const note = notes.find(n => n.id === req.params.id);
  if (!note) return res.status(404).json({ error: "Note not found" });
  res.json(note);
});

// Xóa note
router.delete("/:id", (req, res) => {
  notes = notes.filter(n => n.id !== req.params.id);
  res.json({ success: true });
});

module.exports = router;
