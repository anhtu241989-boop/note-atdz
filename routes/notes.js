const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getNote, createNote, updateNote } = require("../models/Note");

const router = express.Router();

// Trang chủ -> tạo note mới
router.get("/", (req, res) => {
  const id = uuidv4();
  createNote(id);
  res.redirect(`/note/${id}`);
});

// Trang editor
router.get("/note/:id", (req, res) => {
  const id = req.params.id;
  let note = getNote(id);
  if (!note) note = createNote(id);
  res.render("index", { note, noteId: id });
});

// API lưu
router.post("/save/:id", (req, res) => {
  const id = req.params.id;
  const { content } = req.body;

  if (typeof content !== "string")
    return res.status(400).json({ success: false, error: "Invalid content" });

  updateNote(id, content);
  res.json({ success: true });
});

// API JSON
router.get("/json/:id", (req, res) => {
  const id = req.params.id;
  const note = getNote(id);
  if (!note) return res.status(404).json({ success: false, error: "Not found" });
  res.json({ success: true, note });
});

// API Raw text
router.get("/api/:id", (req, res) => {
  const id = req.params.id;
  const note = getNote(id);
  if (!note) return res.status(404).send("❌ Note không tồn tại");
  res.type("text/plain").send(note.content || "");
});

module.exports = router;
