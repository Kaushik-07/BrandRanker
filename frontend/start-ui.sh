#!/bin/bash

echo "🚀 Starting Brand Ranker UI..."

# Kill any existing processes on port 3000
echo "Stopping any existing processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Build the application
echo "Building the React application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Start the server
    echo "Starting server on http://localhost:3000..."
    echo "Opening browser..."
    open http://localhost:3000
    
    # Serve the application
    cd build && npx serve -l 3000
else
    echo "❌ Build failed!"
    exit 1
fi 