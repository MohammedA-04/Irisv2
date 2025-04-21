#!/bin/bash

# Deployment script for the Deepfake Detection Frontend

echo "👉 Starting deployment process..."

# Step 1: Install dependencies
echo "👉 Installing dependencies..."
npm install

# Step 2: Run tests
echo "👉 Running tests..."
npm test

# Check if tests passed
if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Deployment aborted."
    exit 1
fi

# Step 3: Build the project
echo "👉 Building project for production..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Deployment aborted."
    exit 1
fi

# Step 4: Deploy to Netlify if netlify-cli is installed
if command -v netlify &> /dev/null; then
    echo "👉 Deploying to Netlify..."
    netlify deploy --prod
else
    echo "⚠️ Netlify CLI not found. Please install it with 'npm install -g netlify-cli'"
    echo "👉 Your build is ready in the 'build' folder."
    echo "   You can deploy it manually by uploading it to Netlify or using another hosting service."
fi

echo "✅ Deployment process completed!" 