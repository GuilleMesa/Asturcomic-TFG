const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 8080;

app.set("trust proxy", 1);
app.use(express.json());

function setNoStoreHeaders(res) {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
}

// /assets para desarrollo local con Vite
app.use(
  "/assets",
  express.static(path.join(__dirname, "public", "assets"), {
    etag: false,
    lastModified: false,
    setHeaders: setNoStoreHeaders,
  })
);

// API
app.get("/api/health", (_req, res) => {
  res.send("OK");
});

app.get("/api/catalog", (_req, res) => {
  setNoStoreHeaders(res);
  const catalogPath = path.join(__dirname, "catalog.json");
  const raw = fs.readFileSync(catalogPath, "utf-8");
  res.type("json").send(raw);
});

app.listen(PORT, () => {
  console.log(`Backend en http://localhost:${PORT}`);
});
