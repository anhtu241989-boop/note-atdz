const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Dữ liệu ghi chú lưu trong RAM (restart thì mất)
let notes = [];

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Trang chủ: hiển thị danh sách ghi chú
app.get("/", (req, res) => {
  res.render("index", { notes });
});

// Thêm ghi chú
app.post("/add", (req, res) => {
  const { note } = req.body;
  if (note && note.trim() !== "") {
    notes.push(note.trim());
  }
  res.redirect("/");
});

// Xóa ghi chú
app.post("/delete/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!isNaN(id) && id >= 0 && id < notes.length) {
    notes.splice(id, 1);
  }
  res.redirect("/");
});

// Chỉnh sửa ghi chú
app.post("/edit/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { newNote } = req.body;
  if (!isNaN(id) && id >= 0 && id < notes.length && newNote.trim() !== "") {
    notes[id] = newNote.trim();
  }
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
