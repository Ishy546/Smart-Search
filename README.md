## AI-Powered Document Search Engine

A simple RAG-based search tool that lets users upload 
PDFs or DOCX files and query their contents through a chatbot interface.

Demo

📍 https://smart-search-xi.vercel.app 

**Features**

Upload and parse PDF/DOCX files using pdf-parse
 and Mammoth.

Splits documents into chunks with 
LangChain RecursiveTextSplitter for efficient embedding.

Generate OpenAI embeddings and store them 
in a Supabase vector store.

Perform semantic similarity search (match_documents) 
to retrieve the most relevant chunks.

Use OpenAI Chat Completions API to generate answers 
grounded in document content.

Limit users to 10 queries per session 
for controlled demo use.

Deployed on Vercel for fast, serverless hosting.

Tech Stack

Frontend/Deployment: Next.js, Vercel
Data Processing: pdf-parse, Mammoth, LangChain
Vector Database: Supabase (pgvector)
LLM Integration: OpenAI embeddings + Chat Completions API

