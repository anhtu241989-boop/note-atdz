const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../notes.json");

let notes = {};

// Load dữ liệu khi khởi động
function loadNotes() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf8").trim();
      notes = raw ? JSON.parse(raw) : {};
    } else {
      notes = {};
    }
  } catch (err) {
    console.error("❌ Lỗi đọc notes.json:", err.message);
    notes = {};
  }
}
loadNotes();

function saveNotes() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2), "utf8");
  } catch (err) {
    console.error("❌ Lỗi ghi notes.json:", err.message);
  }
}

function getNote(id) {
  return notes[id] || null;
}

function createNote(id, content = "") {
  notes[id] = { content };
  saveNotes();
  return notes[id];
}

function updateNote(id, content) {
  if (!notes[id]) notes[id] = { content: "" };
  notes[id].content = content;
  saveNotes();
  return notes[id];
}

module.exports = { getNote, createNote, updateNote };
