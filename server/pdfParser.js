// pdfParser.js
import fs from "fs";
import path from "path";
import PDFParser from "pdf2json";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log("openai::::", openai)
console.log("process.env.OPENAI_API_KEY", process.env)

// ------------------ Parse single PDF ------------------
export function parseSinglePDF(filePath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`File not found: ${filePath}`));
    }

    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", err => reject(err.parserError));
    pdfParser.on("pdfParser_dataReady", pdfData => resolve(pdfData));

    pdfParser.loadPDF(filePath);
  });
}

// ------------------ Convert PDF text to chart data (Cpk only) ------------------
export function parsePDFTextToChartData(pdfData, pageNumber = 7) { // page 8 default
  if (!pdfData?.Pages || pdfData.Pages.length <= pageNumber) {
    return { labels: [], datasets: [] };
  }

  const page = pdfData.Pages[pageNumber];

  // Flatten all text items
  const textItems = page.Texts
    .map(item => decodeURIComponent(item.R[0].T).trim())
    .filter(Boolean)
    .map(t =>
      t.replace(/[’‘‛′`´]/g, "'").replace(/[–—−]/g, "-")
    );

  // Extract months
  const months = textItems.filter(t =>
    t.match(/\d{2}'?[A-Za-z]{3}/) || t.match(/[A-Za-z]{3}-\d{2,4}/)
  );

  if (!months.length) return { labels: [], datasets: [] };

  // Build datasets
  const datasets = [];
  let i = 0;
  while (i < textItems.length) {
    const token = textItems[i];
    if (months.includes(token)) { i++; continue; }

    // Collect metric name
    const nameTokens = [];
    while (i < textItems.length && isNaN(parseFloat(textItems[i].replace("%", "")))) {
      if (!months.includes(textItems[i])) nameTokens.push(textItems[i]);
      i++;
    }

    // Collect numeric values
    const values = [];
    for (let j = 0; j < months.length && i < textItems.length; j++, i++) {
      const val = parseFloat(textItems[i].replace("%", ""));
      if (!isNaN(val)) values.push(val);
    }

    if (values.length === months.length) {
      datasets.push({ name: nameTokens.join(" "), data: values });
    }
  }

  return { labels: months, datasets };
}

// ------------------ Summarize a single PDF page ------------------
export async function summarizePDFPage(filePath, pageNumber = 7) {
  const pdfData = await parseSinglePDF(filePath);
  const chartData = parsePDFTextToChartData(pdfData, pageNumber);

  let summary = "";
  if (chartData.datasets.length) {
    // Prepare summary prompt for AI
    const summaryPrompt = `Summarize the Cpk table data for the months ${chartData.labels.join(
      ", "
    )}:\n` +
      chartData.datasets.map(d => `${d.name}: ${d.data.join(", ")}`).join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a data analyst summarizing supplier trends." },
        { role: "user", content: summaryPrompt },
      ],
    });

    summary = completion.choices[0].message.content;
  }

  return { chartData, summary };
}
