#!/bin/bash

echo "🚀 Setting up ngrok for production deployment..."

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed. Installing now..."
    npm install -g ngrok
fi

echo "✅ ngrok is installed"

echo ""
echo "📋 Instructions:"
echo "1. Start your backend: cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo "2. In another terminal, run: ngrok http 8000"
echo "3. Copy the ngrok URL (e.g., https://abc123.ngrok.io)"
echo "4. Update frontend API URL:"
echo "   cd frontend"
echo "   echo 'REACT_APP_API_URL=https://abc123.ngrok.io' > .env"
echo "   npm run build"
echo "   firebase deploy"
echo ""
echo "🎯 Your Firebase app will then work with authentication!" 