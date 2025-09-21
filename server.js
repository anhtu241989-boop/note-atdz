const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const dataFile = path.join(__dirname, "notes.json");
let notes = {};

// Load dữ liệu nếu có
if (fs.existsSync(dataFile) && fs.readFileSync(dataFile, "utf8").trim() !== "") {
  try {
    notes = JSON.parse(fs.readFileSync(dataFile, "utf8"));
  } catch (e) {
    console.error("❌ Lỗi đọc notes.json:", e);
    notes = {};
  }
}

app.use(express.json());

// 📌 Hàm tạo UUID custom
function customUUID() {
  const ts = Date.now().toString(16);
  const rand = Math.random().toString(16).substring(2, 10);
  return ts + "-" + rand;
}

function saveNotes() {
  fs.writeFileSync(dataFile, JSON.stringify(notes, null, 2));
}

// Trang gốc -> tạo note mới
app.get("/", (req, res) => {
  const id = customUUID();
  notes[id] = { content: "Start typing..." };
  saveNotes();
  res.redirect(`/note/${id}`);
});

// Trang note
app.get("/note/:id", (req, res) => {
  const id = req.params.id;
  if (!notes[id]) {
    notes[id] = { content: "Start typing..." };
    saveNotes();
  }

  const page = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Note ATDZ</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/codemirror.min.css">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/theme/dracula.min.css">
      <style>
        body { margin:0; background:#1e1e1e; color:#ddd; font-family:sans-serif; }
        header { padding:10px; background:#111; border-bottom:1px solid #333; display:flex; justify-content:space-between; align-items:center; }
        header h1 { margin:0; font-size:16px; font-weight:600; }
        header small { font-size:12px; color:#888; }
        .toggle-mode { cursor:pointer; font-size:14px; background:#222; padding:4px 10px; border-radius:6px; border:1px solid #444; }
        #editor { height:calc(100vh - 55px); }
        .CodeMirror { height:100% !important; font-size:13px; font-weight:500; letter-spacing:0.4px; line-height:1.6; }
      </style>
    </head>
    <body>
      <header>
        <div>
          <h1>Note Service</h1>
          <small>Changes auto-saved after 1s</small>
        </div>
        <div class="toggle-mode" onclick="toggleTheme()">☀ Light Mode</div>
      </header>
      <textarea id="editor">${notes[id].content}</textarea>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/codemirror.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/javascript/javascript.min.js"></script>
      <script>
        let editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
          lineNumbers: true,
          mode: "javascript",
          theme: "dracula"
        });
        let timeout;
        editor.on("change", () => {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            fetch("/save/${id}", {
              method:"POST",
              headers:{ "Content-Type":"application/json" },
              body:JSON.stringify({ content: editor.getValue() })
            });
          }, 1000);
        });
        function toggleTheme() {
          let newTheme = editor.getOption("theme") === "dracula" ? "default" : "dracula";
          editor.setOption("theme", newTheme);
          document.body.style.backgroundColor = newTheme === "dracula" ? "#1e1e1e" : "#fff";
          document.body.style.color = newTheme === "dracula" ? "#ddd" : "#000";
          document.querySelector(".toggle-mode").innerText =
            newTheme === "dracula" ? "☀ Light Mode" : "🌙 Dark Mode";
        }
      </script>
    </body>
    </html>
  `;

  res.send(page);
});

// API save
app.post("/save/:id", (req, res) => {
  const id = req.params.id;
  const { content } = req.body;
  if (notes[id]) {
    notes[id].content = content;
    saveNotes();
  }
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
