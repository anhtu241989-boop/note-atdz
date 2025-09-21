// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, "notes.json");

// --- Load notes from file (safe) ---
let notes = {};
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, "utf8").trim();
    if (raw) {
      notes = JSON.parse(raw);
      console.log("✅ Loaded notes.json");
    } else {
      notes = {};
    }
  } else {
    notes = {};
  }
} catch (err) {
  console.error("❌ Error reading notes.json - starting with empty db:", err);
  notes = {};
}

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public"))); 

// --- Helpers ---
function customUUID() {
  const ts = Date.now().toString(16);
  const rand = Math.random().toString(16).substring(2, 10);
  return `${ts}-${rand}`;
}

function saveNotesToFile() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2), "utf8");
  } catch (err) {
    console.error("❌ Error writing notes.json:", err);
  }
}

// --- Routes ---

// GET / -> create a new note and redirect
app.get("/", (req, res) => {
  const id = customUUID();
  notes[id] = { content: "" }; // <-- rỗng, placeholder sẽ do frontend hiển thị
  saveNotesToFile();
  return res.redirect(`/note/${id}`);
});

// GET /note/:id -> render index.ejs and pass note and noteId
app.get("/note/:id", (req, res) => {
  const id = req.params.id;
  if (!notes[id]) {
    notes[id] = { content: "" }; // <-- rỗng
    saveNotesToFile();
  }
  return res.render("index", { note: notes[id], noteId: id });
});

// POST /save/:id -> save note content (autosave)
app.post("/save/:id", (req, res) => {
  const id = req.params.id;
  const { content } = req.body;

  if (!id) return res.status(400).json({ success: false, error: "Missing id" });
  if (!notes[id]) notes[id] = { content: "" };

  notes[id].content = typeof content === "string" ? content : "";
  saveNotesToFile();
  return res.json({ success: true });
});

// Optional: GET /api/:id -> return JSON
app.get("/api/:id", (req, res) => {
  const id = req.params.id;
  if (!notes[id]) return res.status(404).json({ success: false, error: "Not found" });
  return res.json({ success: true, note: notes[id] });
});

// 404
app.use((req, res) => res.status(404).send("Not found"));

// Start
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
