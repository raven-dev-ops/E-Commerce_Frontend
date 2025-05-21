# Stage 1: Build frontend using Node
FROM node:23-alpine AS frontend-build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Setup Python backend and serve frontend
FROM python:3.13-slim

WORKDIR /app

# Install system dependencies needed for git (and maybe other things)
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Install backend Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . .

# Copy frontend build output from frontend-build stage
COPY --from=frontend-build /app/build ./build

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Adjust the command to run your backend
CMD ["python", "app.py"]
