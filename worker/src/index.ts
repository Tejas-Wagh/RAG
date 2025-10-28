import { Redis } from "ioredis";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis({
  port: 6379,
  host: "localhost",
});

async function processFiles() {
  while (true) {
    const resData = await redis.brpop("files", 0);
    if (!resData) {
      continue;
    }

    const file = JSON.parse(resData[1]);
    console.log(file);

    const filePath = file.path;

    //load and extract the documents page by page
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();

    //generate embeddings
    const model = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY as string,
      modelName: "text-embedding-004",
    });

    const documentRes = await model.embedDocuments(
      docs.map((doc) => doc.pageContent)
    );

    // Sanitize collection name
    const collectionName = file.originalname.replace(/[^a-zA-Z0-9-_]/g, "_");

    const points = documentRes.map((vector, index) => ({
      id: Date.now() + index,
      vector,
      payload: {
        //@ts-ignore
        text: docs[index].pageContent,
        source: file.originalname,
        page: index,
      },
    }));

    const client = new QdrantClient({ url: "http://localhost:6333" });

    // ✅ Ensure collection exists with correct vector size
    const exists = await client
      .getCollections()
      .then((res) => res.collections.some((c) => c.name === collectionName));

    if (!exists) {
      await client.createCollection(collectionName, {
        vectors: {
          //@ts-ignore
          size: documentRes[0]?.length, // e.g., 768 for Gemini/TextEmbedding
          //@ts-ignore
          distance: "Cosine",
        },
      });
    }

    // ✅ Now insert vectors
    await client.upsert(collectionName, {
      points,
    });

    console.log("Points added to qdrant db");
  }
}

processFiles();
