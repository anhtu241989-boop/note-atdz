const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid"); // import uuid

const app = express();
const PORT = process.env.PORT || 3000;

// Lưu notes trong file JSON
const DATA_FILE = path.join(__dirname, "notes.json");

// Đọc dữ liệu notes từ file (nếu chưa có thì tạo rỗng)
let notes = {};
if (fs.existsSync(DATA_FILE)) {
  notes = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Trang chủ → tạo note mới
app.get("/", (req, res) => {
  const id = uuidv4(); // tạo id UUID
  notes[id] = { content: "Start typing..." };
  saveNotes();
  res.redirect(`/note/${id}`);
});

// Hiển thị note
app.get("/note/:id", (req, res) => {
  const note = notes[req.params.id];
  if (!note) return res.status(404).send("Note not found");
  res.render("index", { note, noteId: req.params.id });
});

// API: lưu note
app.post("/save/:id", (req, res) => {
  const { content } = req.body;
  if (!notes[req.params.id]) {
    notes[req.params.id] = { content: "" };
  }
  notes[req.params.id].content = content;
  saveNotes();
  res.json({ success: true, note: notes[req.params.id] });
});

// Lưu notes ra file
function saveNotes() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2), "utf-8");
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
