import express from "express";
import cors from "cors";
import fs from "fs";
import { upload } from "./storage.js";
import { Redis } from "ioredis";
import dotenv from "dotenv";
import {
  fetchEmbeddings,
  generateEmbeddings,
  generateResponse,
} from "./service.js";

const redis = new Redis({
  port: 6379,
  host: "localhost",
});

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

if (!fs.existsSync("../uploads")) {
  fs.mkdirSync("../uploads");
}

app.get("/", (req, res) => {
  res.send("Hello World123!");
});

app.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("No file uploaded");

  redis.lpush("files", JSON.stringify(file));

  res.json({ message: "File uploaded successfully" });
});

app.post("/chat", async (req, res) => {
  const { query, file_name } = await req.body;
  const queryEmbedding = await generateEmbeddings(query);
  const chunks = await fetchEmbeddings(file_name, queryEmbedding);
  const response = await generateResponse(query, chunks);
  res.json({
    response,
  });
});

app.listen(8000, () => console.log(`Server is running on port 8000`));
