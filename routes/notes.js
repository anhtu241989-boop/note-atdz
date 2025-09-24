const express = require("express");
const { getNote, createNote, updateNote } = require("../models/Note");

const router = express.Router();

// Hàm tạo ID ngẫu nhiên dạng chữ cái (8 ký tự)
function generateId(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let id = "";
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Trang chủ -> tạo note mới
router.get("/", (req, res) => {
  let id;
  // Tạo ID duy nhất, tránh trùng với notes hiện có
  do {
    id = generateId();
  } while (getNote(id));

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

// Lưu nội dung note
router.post("/save/:id", (req, res) => {
  const id = req.params.id;
  const { content } = req.body;

  if (typeof content !== "string")
    return res.status(400).json({ success: false, error: "Invalid content" });

  updateNote(id, content);
  res.json({ success: true });
});

// JSON API (giữ nguyên)
router.get("/json/:id", (req, res) => {
  const id = req.params.id;
  const note = getNote(id);
  if (!note) return res.status(404).json({ success: false, error: "Not found" });
  res.json({ success: true, note });
});

// Raw text API (đổi từ /api -> /raw)
router.get("/raw/:id", (req, res) => {
  const id = req.params.id;
  const note = getNote(id);
  if (!note) return res.status(404).send("❌ Note không tồn tại");
  res.type("text/plain").send(note.content || "");
});

module.exports = router;
