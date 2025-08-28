import { openai } from "./config"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { supabaseClient } from "./config";
import { OpenAI } from "openai"
// --- Types ---
interface DocumentChunk {
  content: string;
  embedding: number[];
}

interface SupabaseMatch {
  content: string;
  similarity: number;
}

// --- DOCUMENT SPLITTING ---
export async function splitDocument(text: string): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 250,
    chunkOverlap: 35,
  });

  const docs = await splitter.createDocuments([text]);
  return docs.map((d) => d.pageContent);
}

// --- EMBEDDING CREATION + STORAGE ---
export async function createAndStoreEmbeddings(chunks: string[]): Promise<void> {
  const batchSize = 100;
  const allData: { content: string; embedding: number[] }[] = [];

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: batch,
    });

    const batchData = batch.map((textChunk, j) => ({
      content: textChunk,
      embedding: embeddingResponse.data[j].embedding,
    }));

    allData.push(...batchData);
  }

  console.log("Storing embeddings:", allData.length, "chunks");

  const { error } = await supabaseClient.from("documents").insert(allData);

  if (error) throw new Error(`Issue inserting data into the database: ${error.message}`);

  console.log(`✅ Stored ${allData.length} embeddings successfully!`);
}
