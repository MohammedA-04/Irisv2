#!/bin/bash

# Deployment script for the Deepfake Detection Backend API

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

# Step 3: Select deployment platform
echo "👉 Select deployment platform:"
echo "1. Vercel"
echo "2. Render"
echo "3. Railway"
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        # Vercel deployment
        echo "👉 Deploying to Vercel..."
        vercel --prod
        ;;
    2)
        # Render deployment
        echo "⚠️ For Render deployment, please use the Render dashboard."
        echo "👉 Instructions:"
        echo "1. Go to https://dashboard.render.com/"
        echo "2. Create a new Web Service"
        echo "3. Connect your repository"
        echo "4. Use the following settings:"
        echo "   - Build Command: npm install"
        echo "   - Start Command: node app.js"
        ;;
    3)
        # Railway deployment
        echo "👉 Deploying to Railway..."
        railway up
        ;;
    *)
        echo "❌ Invalid choice. Deployment aborted."
        exit 1
        ;;
esac

echo "✅ Deployment process completed!" 