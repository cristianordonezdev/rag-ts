// src/rag.ts

import { Chroma } from "@langchain/community/vectorstores/chroma";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { Document } from "@langchain/core/documents";
import { v4 as uuidv4 } from "uuid";

// Constantes
const CHROMA_URL = "http://localhost:8000";
const COLLECTION_NAME = "docs";

// Cargar modelo de embeddings (equivalente a HuggingFaceEmbeddings)
export async function createEmbeddings() {
  return new HuggingFaceTransformersEmbeddings({
    modelName: "Xenova/all-MiniLM-L6-v2",
  });
}

// Inicializar la base de datos Chroma
export async function initializeChroma(embeddings: HuggingFaceTransformersEmbeddings) {
  const db = await Chroma.fromDocuments([], embeddings, {
    collectionName: COLLECTION_NAME,
    url: CHROMA_URL,
  });

  return db;
}

// Función para cargar los chunks en Chroma
export async function ingestChunks(chunks: string[], db: Chroma) {
  try {
    console.log("🧹 Eliminando documentos anteriores...");
    const previousDocs = await db.similaritySearch("document", 1000);
    const ids = previousDocs.map((doc: any) => doc.metadata?.source).filter(Boolean);
    if (ids.length > 0 && db.collection) {
      await db.collection.delete({ ids });
      console.log(`🗑️ Se eliminaron ${ids.length} documentos anteriores.`);
    } else {
      console.log("📂 No había documentos para eliminar.");
    }
  } catch (e) {
    console.warn("⚠️ No se pudo eliminar documentos previos:", e);
  }

  const docs: Document[] = chunks.map((chunk) => {
    return new Document({
      pageContent: chunk,
      metadata: { source: `chunk_${uuidv4()}` },
    });
  });

  await db.addDocuments(docs);
  console.log(`✅ ${docs.length} nuevos chunks agregados.`);
}
