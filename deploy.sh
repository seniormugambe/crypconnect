#!/bin/bash

# Deploy script for CrypConnect to Render

echo "🚀 Starting deployment to Render..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Build output in ./dist directory"
    echo "🌐 Ready for deployment to Render"
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🎉 Deployment script completed!"
echo "💡 Next steps:"
echo "   1. Push your code to GitHub/GitLab"
echo "   2. Connect your repository to Render"
echo "   3. Configure environment variables in Render dashboard"
echo "   4. Deploy!" 