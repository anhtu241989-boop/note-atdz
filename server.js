// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");

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

// API Preview (hiển thị web gọn đẹp)
app.get("/api/:id", (req, res) => {
  const id = req.params.id;

  if (!notes[id]) {
    return res
      .status(404)
      .send(
        "<h2 style='font-family:sans-serif;color:#ff4444;text-align:center;margin-top:50px'>❌ Note không tồn tại</h2>"
      );
  }

  const content = notes[id].content || "";

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Note Preview</title>
      <style>
        body {
          background: #121212;
          color: #eaeaea;
          font-family: 'Segoe UI', 'Roboto', 'Inter', sans-serif;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          min-height: 100vh;
          padding: 40px 20px;
        }
        .note-container {
          background: #1e1e1e;
          padding: 25px;
          border-radius: 12px;
          max-width: 800px;
          width: 100%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          line-height: 1.6;
          font-size: 1rem;
          font-weight: 300;
          white-space: pre-wrap;
        }
        h2 {
          text-align: center;
          font-weight: 400;
          margin-bottom: 20px;
          color: #00d1ff;
        }
      </style>
    </head>
    <body>
      <div class="note-container">
        <h2>📄 Note Preview</h2>
        <div>${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
      </div>
    </body>
    </html>
  `);
});

// 404
app.use((req, res) => res.status(404).send("Not found"));

// Start
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
