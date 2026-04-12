const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 8080;

app.set("trust proxy", 1);
app.use(express.json());

// /assets para desarrollo local con Vite
app.use("/assets", express.static(path.join(__dirname, "public", "assets")));

// API
app.get("/api/health", (_req, res) => {
  res.send("OK");
});

app.get("/api/catalog", (_req, res) => {
  const catalogPath = path.join(__dirname, "catalog.json");
  const raw = fs.readFileSync(catalogPath, "utf-8");
  res.type("json").send(raw);
});

app.listen(PORT, () => {
  console.log(`Backend en http://localhost:${PORT}`);
});