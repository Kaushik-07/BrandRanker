#!/bin/bash

echo "🚀 Deploying BrandRanker to Render..."

# Create a new service on Render
curl -X POST "https://api.render.com/v1/services" \
  -H "Authorization: Bearer $RENDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "brand-ranker-backend",
    "type": "web",
    "env": "python",
    "buildCommand": "cd backend && pip install -r requirements.txt",
    "startCommand": "cd backend && gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:\$PORT"
  }'

echo "✅ Deployment initiated!" 