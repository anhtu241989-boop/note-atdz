// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, "notes.json");

// --- Load notes from file ---
let notes = {};
function loadNotes() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf8").trim();
      notes = raw ? JSON.parse(raw) : {};
      console.log("✅ Loaded notes.json");
    } else {
      notes = {};
    }
  } catch (err) {
    console.error("❌ Error reading notes.json, reset to empty:", err.message);
    notes = {};
  }
}
loadNotes();

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// --- Helpers ---
function saveNotesToFile() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2), "utf8");
  } catch (err) {
    console.error("❌ Error writing notes.json:", err.message);
  }
}

// --- Routes ---

// GET / -> create new note
app.get("/", (req, res) => {
  const id = uuidv4();
  notes[id] = { content: "Start typing..." };
  saveNotesToFile();
  res.redirect(`/note/${id}`);
});

// GET /note/:id -> render editor
app.get("/note/:id", (req, res) => {
  const id = req.params.id;
  if (!notes[id]) {
    notes[id] = { content: "Start typing..." };
    saveNotesToFile();
  }
  res.render("index", { note: notes[id], noteId: id });
});

// POST /save/:id -> autosave
app.post("/save/:id", (req, res) => {
  const id = req.params.id;
  const { content } = req.body;

  if (!id) return res.status(400).json({ success: false, error: "Missing id" });
  if (typeof content !== "string")
    return res.status(400).json({ success: false, error: "Invalid content" });

  if (!notes[id]) notes[id] = { content: "" };
  notes[id].content = content;
  saveNotesToFile();

  res.json({ success: true });
});

// JSON API
app.get("/json/:id", (req, res) => {
  const id = req.params.id;
  if (!notes[id])
    return res.status(404).json({ success: false, error: "Not found" });
  res.json({ success: true, note: notes[id] });
});

// API Raw text
app.get("/api/:id", (req, res) => {
  const id = req.params.id;
  if (!notes[id]) return res.status(404).send("❌ Note không tồn tại");
  res.type("text/plain").send(notes[id].content || "");
});

// 404 fallback
app.use((req, res) => res.status(404).send("Not found"));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
