# Use Node to build frontend first
FROM node:23-alpine AS frontend-build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Use Python image for backend and serve frontend build files
FROM python:3.13-slim

WORKDIR /app

# Install system dependencies needed for git
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Install backend dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code (adjust if your backend files are in specific folders)
COPY . .

# Copy frontend build output from frontend-build stage
COPY --from=frontend-build /app/build ./build

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Command to run your backend (adjust as needed)
CMD ["python", "app.py"]
