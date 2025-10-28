#!/bin/bash

# Start Docker services
echo "Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 5

# Start server in background
echo "Starting server..."
cd server && npm run dev &

# Start worker in background
echo "Starting worker..."
cd ../worker && npm run dev &

echo "All services started!"
echo "Server: http://localhost:8000"
echo "Qdrant: http://localhost:6333/dashboard"
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
wait