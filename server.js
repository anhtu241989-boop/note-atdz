const express = require("express");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Fake DB (in-memory)
const notes = {};

// Trang chủ -> tạo note mới
app.get("/", (req, res) => {
  const id = uuidv4();
  notes[id] = { content: "Start typing..." };
  res.redirect(`/note/${id}`);
});

// Xem note
app.get("/note/:id", (req, res) => {
  const id = req.params.id;
  if (!notes[id]) {
    notes[id] = { content: "Start typing..." };
  }
  res.render("index", { noteId: id, note: notes[id] });
});

// Lưu note
app.post("/save/:id", (req, res) => {
  const id = req.params.id;
  const { content } = req.body;
  notes[id] = { content };
  res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
