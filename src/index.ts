import fs from "fs";
import path from "path";
import { splitText, loadFile } from "./utils";
import { createEmbeddings, initializeChroma, ingestChunks } from "./rag";
import ollama from "ollama";
 
async function main() {
  const dataDir = "docs";
  let allText = "";

  const files = fs.readdirSync(dataDir);

  for (const filename of files) {
    const fullPath = path.join(dataDir, filename);

    if (fs.statSync(fullPath).isFile()) {
      const content = await loadFile(fullPath);
      if (content) {
        allText += `\n\n--- Documento: ${filename} ---\n\n${content}`;
      }
    }
  }

  const chunks = splitText(allText);
  const embeddings = await createEmbeddings();
  const db = await initializeChroma(embeddings);

  await ingestChunks(chunks, db);

  console.log("✅ Archivos indexados correctamente.");

  // const response = await ollama.chat({
  //   model: 'llama3.1',
  //   messages: [{ role: 'user', content: 'Why is the sky blue?' }],
  // })
  // console.log(response.message.content)
}

main().catch(console.error);
