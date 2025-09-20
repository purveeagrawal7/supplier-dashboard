import fs from "fs";
import path from "path";
import PDFParser from "pdf2json";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // make sure you set this in .env
});

// 🔹 Helper: Parse a single PDF and return extracted text
export function parseSinglePDF(filePath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`File not found: ${filePath}`));
    }

    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", err => reject(err.parserError));
    pdfParser.on("pdfParser_dataReady", pdfData => {
      resolve(pdfParser.getRawTextContent());
    });

    pdfParser.loadPDF(filePath);
  });
}

// 🔹 Parse all PDFs in /sample-pdfs, concatenate text, and summarize with OpenAI
export async function parsePDFsWithAI(from, to) {
  const folderPath = path.resolve("./sample-pdfs");

  if (!fs.existsSync(folderPath)) {
    throw new Error(`❌ Folder not found: ${folderPath}. Please create it and add some PDFs.`);
  }

  const files = fs.readdirSync(folderPath).filter(f => f.endsWith(".pdf"));

  if (files.length === 0) {
    throw new Error(`❌ No PDFs found in ${folderPath}. Add at least one PDF to test.`);
  }

  let allText = "";
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const text = await parseSinglePDF(filePath);
    allText += `\n\n--- ${file} ---\n${text}`;
  }

  // 🔹 Summarize supplier trends using OpenAI
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini", // lightweight and fast model
    messages: [
      { role: "system", content: "You are a data analyst summarizing supplier trends." },
      { role: "user", content: `Summarize supplier trends in this data: ${allText}` },
    ],
  });

  return {
    invoices: files,
    summary: completion.choices[0].message.content,
  };
}
