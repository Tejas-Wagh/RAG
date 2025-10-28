import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { QdrantClient } from "@qdrant/js-client-rest";
const client = new QdrantClient({ url: "http://localhost:6333" });

export async function generateEmbeddings(query: string) {
  const model = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY as string,
    modelName: "text-embedding-004",
  });

  const documentRes = await model.embedQuery(query);

  return documentRes;
}

export async function fetchEmbeddings(
  file_name: string,
  queryVector: number[]
) {
  const collectionName = file_name.replace(/[^a-zA-Z0-9-_]/g, "_");
  
  // Check if collection exists first
  const collections = await client.getCollections();
  const exists = collections.collections.some((c) => c.name === collectionName);
  
  if (!exists) {
    throw new Error(`Collection '${collectionName}' not found`);
  }
  
  const searchResult = await client.search(collectionName, {
    vector: queryVector,
    limit: 5,
    with_payload: true,
  });

  return searchResult.map((item) => item.payload);
}

export async function generateResponse(query: string, chunks: any[]) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Construct the prompt with the retrieved chunks as context
  const context = chunks.map((chunk) => chunk.text).join("\n\n"); // Assuming each chunk has a 'text' field
  const prompt = `Context:\n${context}\n\nQuestion: ${query}\n\nAnswer:`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  return text;
}
