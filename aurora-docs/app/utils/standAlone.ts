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

// --- MAIN PIPELINE ---
async function main(query: string): Promise<void> {
  try {
    // Step 1: Embed query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: query,
    });

    const queryEmbedding: number[] = embeddingResponse.data[0].embedding;

    // Step 2: Find matches
    const match = await findNearestMatch(queryEmbedding);

    // Step 3: Get chat response
    await getChatCompletion(match, query);

  } catch (error) {
    console.error("Error in main function.", error);
  }
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
  const data: DocumentChunk[] = await Promise.all(
    chunks.map(async (textChunk): Promise<DocumentChunk> => {
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: textChunk,
      });

      return {
        content: textChunk,
        embedding: embeddingResponse.data[0].embedding,
      };
    })
  );

  const { error } = await supabaseClient.from("documents").insert(data);

  if (error) throw new Error(`Issue inserting data into the database: ${error.message}`);
  console.log("✅ Embeddings stored successfully!");
}

// --- VECTOR SEARCH ---
async function findNearestMatch(queryEmbedding: number[]): Promise<string> {
  const { data, error } = await supabaseClient.rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_threshold: 0.5,
    match_count: 4,
  });

  if (error) throw new Error(`Supabase match error: ${error.message}`);
  if (!data) return "";

  const matches: SupabaseMatch[] = data;
  return matches.map((obj) => obj.content).join("\n");
}

// --- CHAT COMPLETION ---
async function getChatCompletion(context: string, query: string): Promise<void> {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `You are an enthusiastic expert at this document who loves answering questions accurately. 
      You will be given some context from this document and a question. 
      Formulate a short answer based on context. 
      If unsure, say "Sorry, I don't know the answer."`,
    },
    {
      role: "user",
      content: `Context: ${context}\n\nQuestion: ${query}`,
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-5-nano",
    messages,
    temperature: 0.5,
    frequency_penalty: 0.5,
  });

  console.log("🤖 Answer:", response.choices[0].message?.content ?? "No response");
}
