const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

// Servir estáticos: /assets/...
app.use("/assets", express.static(path.join(__dirname, "public", "assets")));

app.get("/api/health", (req, res) => res.send("OK"));

app.get("/api/catalog", (req, res) => {
  const catalogPath = path.join(__dirname, "catalog.json");
  const raw = fs.readFileSync(catalogPath, "utf-8");
  res.type("json").send(raw);
});

app.listen(8080, () => console.log("Backend en http://localhost:8080"));