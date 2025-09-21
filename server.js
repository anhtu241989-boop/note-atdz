// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid"); // ✅ dùng uuid chuẩn

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, "notes.json");

// --- Load notes from file ---
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
  const id = uuidv4(); // ✅ sinh id bằng uuid v4
  notes[id] = { content: "Start typing..." };
  saveNotesToFile();
  return res.redirect(`/note/${id}`);
});

// GET /note/:id -> render editor
app.get("/note/:id", (req, res) => {
  const id = req.params.id;
  if (!notes[id]) {
    notes[id] = { content: "Start typing..." };
    saveNotesToFile();
  }
  return res.render("index", { note: notes[id], noteId: id });
});

// POST /save/:id -> autosave note
app.post("/save/:id", (req, res) => {
  const id = req.params.id;
  const { content } = req.body;

  if (!id) return res.status(400).json({ success: false, error: "Missing id" });
  if (!notes[id]) notes[id] = { content: "" };

  notes[id].content = typeof content === "string" ? content : "";
  saveNotesToFile();
  return res.json({ success: true });
});

// JSON API (cho bot, code gọi)
app.get("/json/:id", (req, res) => {
  const id = req.params.id;
  if (!notes[id])
    return res.status(404).json({ success: false, error: "Not found" });
  return res.json({ success: true, note: notes[id] });
});

// API Raw (trả về nội dung thô của note)
app.get("/api/:id", (req, res) => {
  const id = req.params.id;

  if (!notes[id]) {
    return res.status(404).send("❌ Note không tồn tại");
  }

  const content = notes[id].content || "";
  res.type("text/plain");   // header dạng text thuần
  res.send(content);        // trả về raw text
});

// 404
app.use((req, res) => res.status(404).send("Not found"));

// Start
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
