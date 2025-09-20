import 'dotenv/config';
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { parseSinglePDF, parsePDFsWithAI } from "./pdfParser.js";
const app = express();
const PORT = 5000;

// Required for serving frontend build with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------- API ROUTES -----------

// Example: parse one PDF
app.get("/api/parse", async (req, res) => {
  try {
    const text = await parseSinglePDF("./sample-pdfs/sample-invoice.pdf");
    res.json({ text });
  } catch (err) {
    console.error("❌ Error parsing PDF:", err);
    res.status(500).json({ error: "Failed to parse PDF" });
  }
});

// Example: parse all PDFs and summarize with AI
app.get("/api/summarize", async (req, res) => {
  try {
    const summary = await parsePDFsWithAI();
    res.json(summary);
  } catch (err) {
    console.error("❌ Error summarizing PDFs:", err);
    res.status(500).json({ error: "Failed to summarize PDF data" });
  }
});

// ----------- FRONTEND BUILD -----------
// Serve static React build
app.use(express.static(path.join(__dirname, "../client/build")));

// Catch-all → send React index.html for unknown routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// ----------- START SERVER -----------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
