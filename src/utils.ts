import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export async function loadFile(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  if ([".txt", ".md", ".log"].includes(ext)) {
    return fs.readFileSync(filePath, "utf-8");
  }

  if (ext === ".pdf") {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  console.warn(`⚠️ Tipo de archivo no soportado: ${ext}`);
  return "";
}

export function splitText(text: string, chunkSize = 200, overlap = 50): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = start + chunkSize;
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }

  return chunks;
}
