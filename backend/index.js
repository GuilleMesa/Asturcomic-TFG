const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 8080;

// Assets SVG 
app.use("/assets", express.static(path.join(__dirname, "public", "assets")));

// Frontend compilado 
const appDist = path.join(__dirname, "public", "app");
app.use(express.static(appDist));

// API
app.get("/api/health", (req, res) => res.send("OK"));

app.get("/api/catalog", (req, res) => {
  const catalogPath = path.join(__dirname, "catalog.json");
  const raw = fs.readFileSync(catalogPath, "utf-8");
  res.type("json").send(raw);
});

// Fallback SPA: cualquier ruta EXCEPTO /api y /assets
app.get(/^(?!\/api\/|\/assets\/).*/, (req, res) => {
  res.sendFile(path.join(appDist, "index.html"));
});

app.listen(PORT, () => console.log(`Backend en http://localhost:${PORT}`));