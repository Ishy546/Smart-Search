import { NextResponse } from "next/server"
import { openai, supabaseClient } from "@/app/utils/config"
import { OpenAI } from "openai"

// --- Vector Search ---
async function findNearestMatch(queryEmbedding: number[]): Promise<string> {
    const { data, error } = await supabaseClient.rpc("match_documents", {
  query_embedding: queryEmbedding,//the embedding of the query
  match_threshold: 0.5,// only return matches with similarity >= 0.5
  match_count: 4,//return top 4 most relevant chunks
});

  if (error) throw new Error(`Supabase match error: ${error.message}`);
  if (!data) return "";// if no results, no context was found

  return data.map((obj: any) => obj.content).join("\n");//loops over matching rows in teh database and joins them
}

// --- Chat Completion ---
async function getChatCompletion(context: string, query: string): Promise<string> { //takes conetxt and query
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [// builds a list of messages in openai's chat completion format
    {
      role: "system",
      content: `You are an enthusiastic expert at this document who loves answering questions accurately. 
      You will be given some context from this document and a question. 
      Formulate a short answer based on context. 
      If unsure, say "Sorry, I don't know the answer."`,
    },
    {
      role: "user",// contains the actual data I want to consider, context and the query
      content: `Context: ${context}\n\nQuestion: ${query}`,
    },
  ];

  const response = await openai.chat.completions.create({// call chat api
    model: "gpt-5-nano",// cheap model because I am broke
    messages,// the system + user instructions
  });

  return response.choices[0].message?.content ?? "No response"; // extracts the ai's first answer, if no answer, says no response, return that string to the caller
}

export async function POST(req: Request){
    try{
        const { query } = await req.json()
        // Step 1: Embed query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: query,
    });
    const queryEmbedding: number[] = embeddingResponse.data[0].embedding;
    
    // Step 2: Vector Search
    const context = await findNearestMatch(queryEmbedding)

    // Step 3: Chat response
    const answer = await getChatCompletion(context, query)

    return NextResponse.json({ answer })
    }catch (error: any){
        console.error("Error in /api/query:", error);
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}