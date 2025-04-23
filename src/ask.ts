// ask.ts
import { createEmbeddings, initializeChroma } from "./rag";
import * as dotenv from "dotenv";
import { HfInference } from '@huggingface/inference';
import readline from "readline";
import ollama from 'ollama'

dotenv.config();

async function askQuestion(question: string) {
  // Step 1: Setup embeddings and vector DB
  const embeddings = await createEmbeddings();
  const db = await initializeChroma(embeddings);

  // Step 2: Find top-k relevant documents
  const results = await db.similaritySearch(question, 3);
  const context = results.map((doc) => doc.pageContent).join("\n");

  // Step 3: Prepare the prompt
  const prompt = `[INST] Usa el siguiente contexto para responder con precisión:\n${context}\n\nPregunta: ${question} [/INST]`;

  // Step 4: Setup Hugging Face client
  const hf = new HfInference(process.env.HF_API_TOKEN);

//   const HF_TOKEN = process.env.HF_API_TOKEN;
//   if (!HF_TOKEN) throw new Error("Missing HF_API_TOKEN in .env file");

//   const client = new InferenceClient({
//     model: "mistralai/Mistral-7B-Instruct-v0.2",
//     token: HF_TOKEN,
//   });

  // Step 5: Query the model
  const response = await hf.textGeneration({
    model: 'google/flan-t5-base',
    inputs: prompt,
    parameters: {
        max_new_tokens: 200,
        temperature: 0.7,
      },
  });

  console.log("\n🤖 Respuesta generada:\n", response.generated_text.trim());
}

// CLI usage
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question("❓ Escribe tu pregunta: ", (input) => {
  askQuestion(input).finally(() => rl.close());
});
