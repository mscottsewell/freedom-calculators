#!/bin/bash

# Quick deployment script for GitHub Pages
# Make this file executable with: chmod +x deploy.sh

echo "🚀 Starting deployment to GitHub Pages..."

# Build the project
echo "📦 Building project..."
npm run build

# Deploy to gh-pages branch
echo "🌐 Deploying to GitHub Pages..."
npm run deploy

echo "✅ Deployment complete!"
echo "Your site will be available at: https://yourusername.github.io/your-repo-name"
echo "Note: It may take a few minutes for changes to appear."