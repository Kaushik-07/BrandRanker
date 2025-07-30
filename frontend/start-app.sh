#!/bin/bash

# Kill any existing processes on port 3000
echo "Stopping any existing processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Build the application
echo "Building the React application..."
npm run build

# Serve the built application
echo "Starting the application on http://localhost:3000..."
echo "Opening browser..."
open http://localhost:3000

# Serve the application
npx serve -s build -l 3000 --single 