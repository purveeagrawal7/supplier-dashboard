import 'dotenv/config';
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { parseSinglePDF, parsePDFTextToChartData, summarizePDFPage } from "./pdfParser.js";

const app = express();
const PORT = 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------- API ROUTES -----------

// Parse single PDF
app.get("/api/parse", async (req, res) => {
  try {
    const rawText = await parseSinglePDF("./sample-pdfs/report.pdf");
    res.json({ text: rawText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to parse PDF" });
  }
});

// Get chart-ready data
app.get("/api/chart-data", async (req, res) => {
  try {
    const rawText = await parseSinglePDF("./sample-pdfs/report.pdf");
    const chartData = parsePDFTextToChartData(rawText);
    res.json(chartData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate chart data" });
  }
});

// Summarize PDFs using AI
app.get("/api/summarize", async (req, res) => {
  try {
    const summary = await summarizePDFPage("./sample-pdfs/report.pdf",7);
    console.log("checking summary",summary)
    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to summarize PDF data" });
  }
});

// Serve React frontend
app.use(express.static(path.join(__dirname, "../client/build")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
