# RAG (Retrieval-Augmented Generation) System

A document processing and question-answering system using PDF uploads, vector embeddings, and AI-powered responses.

## Architecture

- **Server**: Express.js API for file uploads and chat endpoints
- **Worker**: Background processor for PDF parsing and vector storage
- **Qdrant**: Vector database for document embeddings
- **Redis**: Message queue for file processing
- **Google Gemini**: AI model for embeddings and text generation

## Setup

1. **Environment Variables**

   ```bash
   cp server/.env.example server/.env
   cp worker/.env.example worker/.env
   ```

   Add your Google API key to both `.env` files.

2. **Start Services**
   
   **Option 1: Using the start script (recommended)**
   ```bash
   ./start.sh
   ```
   
   **Option 2: Manual startup**
   ```bash
   docker-compose up -d
   cd server && npm run dev &
   cd ../worker && npm run dev &
   ```

## API Endpoints

### Upload PDF

```bash
POST /upload
Content-Type: multipart/form-data
Body: file (PDF)
```

### Chat with Document

```bash
POST /chat
Content-Type: application/json
Body: {
  "query": "Your question",
  "file_name": "document.pdf"
}
```

## Usage

1. Upload a PDF file using the `/upload` endpoint
2. Wait for the worker to process the file (check logs)
3. Ask questions about the document using the `/chat` endpoint with the original filename

## Services

- **Server**: http://localhost:8000
- **Qdrant Dashboard**: http://localhost:6333/dashboard
- **Redis**: localhost:6379
