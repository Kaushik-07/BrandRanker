# BrandRanker - AI-Powered Brand Analysis Platform

A sophisticated full-stack web application that leverages AI to rank brands across different categories with intelligent insights and interactive visualizations.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Overview

BrandRanker is a modern web application that uses AI to analyze and rank brands across various categories. The platform provides intelligent insights, interactive visualizations, and comprehensive brand comparison tools.

### Key Capabilities

- **AI-Powered Rankings**: Uses Perplexity Pro AI for intelligent brand analysis
- **Multi-Category Analysis**: Compare brands across up to 3 categories simultaneously
- **Interactive Visualizations**: Dynamic charts and detailed insights
- **User Authentication**: Secure JWT-based user management
- **Experiment History**: Track and compare past analyses
- **Real-time Performance Monitoring**: System health and efficiency metrics

## Features

### Core Functionality

- **User Authentication & Authorization**
  - JWT-based secure authentication
  - User registration and login
  - Password hashing with bcrypt
  - Session management

- **Experiment Creation**
  - Add up to 5 companies for comparison
  - Select up to 3 categories for analysis
  - Real-time validation of inputs
  - AI-powered ranking generation

- **AI Analysis**
  - Perplexity Pro AI integration
  - Intelligent brand ranking across categories
  - Detailed reasoning for each ranking
  - Fallback mechanisms for API failures

- **Data Visualization**
  - Interactive bar charts for rankings
  - Performance comparison tables
  - Brand insights and analysis
  - Historical experiment tracking

### Advanced Features

- **Performance Optimization**
  - Async processing for faster results
  - Redis caching with intelligent fallback
  - Connection pooling for databases
  - Rate limiting and throttling

- **Real-time Monitoring**
  - System performance metrics
  - Health checks and status monitoring
  - Error tracking and recovery
  - Resource usage analytics

- **Responsive Design**
  - Mobile-first approach
  - Modern glassmorphism UI
  - Interactive animations
  - Cross-browser compatibility

## Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.8+)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT with bcrypt
- **AI Integration**: Perplexity Pro API
- **Caching**: Redis
- **Testing**: pytest

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with React-Chartjs-2
- **State Management**: React Context API
- **Routing**: React Router DOM
- **HTTP Client**: Axios

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 15
- **Caching**: Redis 7
- **Development**: Hot reloading

## Architecture

### Backend Architecture

```
backend/
├── app/
│   ├── api/           # API endpoints and routes
│   ├── core/          # Configuration and database setup
│   ├── models/        # Database models
│   ├── services/      # Business logic and external services
│   └── utils/         # Utility functions
├── migrations/         # Database migrations
├── tests/             # Test files
└── main.py           # Application entry point
```

### Frontend Architecture

```
frontend/src/
├── components/        # Reusable UI components
├── contexts/          # React contexts (Auth, etc.)
├── pages/            # Page components
├── services/         # API service functions
├── types/            # TypeScript type definitions
└── App.tsx          # Main application component
```

## Prerequisites

Before running this application, ensure you have the following installed:

- **Python 3.8 or higher**
- **Node.js 16 or higher**
- **Docker and Docker Compose**
- **Git**

### System Requirements

- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: At least 2GB free space
- **Network**: Internet connection for API calls

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd BrandRanker
```

### 2. Environment Setup

Create environment files for the backend:

```bash
# Create backend environment file
cp backend/.env.example backend/.env
```

Edit the environment file with your configuration:

```bash
nano backend/.env
```

### 3. Start Infrastructure Services

```bash
# Start PostgreSQL and Redis using Docker
docker-compose up -d db redis
```

### 4. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Initialize database (if needed)
python init_db.py
```

### 5. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

## Configuration

### Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/brandranker

# Security
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Service
PERPLEXITY_API_KEY=your_perplexity_api_key_here

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Application Settings
ENVIRONMENT=development
DEBUG=True
```

### Required API Keys

1. **Perplexity API Key**: Get from [Perplexity AI](https://www.perplexity.ai/)
2. **Database**: PostgreSQL instance (local or cloud)
3. **Redis**: For caching (optional but recommended)

## Running the Application

### Option 1: Automated Setup (Recommended)

Create a startup script:

```bash
# Create startup script
cat > start-app.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting BrandRanker Application..."

# Start infrastructure
echo "📦 Starting infrastructure services..."
docker-compose up -d db redis

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Start backend
echo "🐍 Starting backend server..."
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start frontend
echo "⚛️ Starting frontend server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "✅ Application started successfully!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"

# Wait for user to stop
echo "Press Ctrl+C to stop all services"
trap "kill $BACKEND_PID $FRONTEND_PID; docker-compose down; exit" INT
wait
EOF

chmod +x start-app.sh
./start-app.sh
```

### Option 2: Manual Setup

#### Start Backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Start Frontend

```bash
cd frontend
npm start
```

### Option 3: Docker Setup

```bash
# Build and start all services
docker-compose up --build
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Experiment Endpoints

- `POST /api/experiments/` - Create new experiment
- `GET /api/experiments/` - Get user's experiments
- `GET /api/experiments/{id}` - Get specific experiment

### Validation Endpoints

- `POST /api/validate/companies` - Validate company names
- `POST /api/validate/categories` - Validate category names

### Health Endpoints

- `GET /health` - System health check
- `GET /api/performance/stats` - Performance metrics

### Interactive API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Usage Guide

### 1. Getting Started

1. **Access the Application**: Open http://localhost:3000
2. **Register/Login**: Create an account or log in
3. **Navigate to Dashboard**: You'll be redirected to the main dashboard

### 2. Creating an Experiment

1. **Add Companies**: Enter up to 5 company names
2. **Select Categories**: Choose up to 3 categories for analysis
3. **Submit**: Click "Create Experiment" to start AI analysis
4. **View Results**: Interactive charts and detailed rankings

### 3. Understanding Results

- **Rankings**: 1 = Best, higher numbers = lower ranking
- **Average Ranks**: Overall performance across all categories
- **Insights**: AI-generated analysis and reasoning
- **Charts**: Visual representation of rankings

### 4. Experiment History

- **View Past Experiments**: Access from dashboard
- **Compare Results**: Side-by-side analysis
- **Export Data**: Download results for further analysis

## Development

### Project Structure

```
BrandRanker/
├── backend/           # FastAPI backend
│   ├── app/          # Application code
│   ├── migrations/   # Database migrations
│   ├── tests/        # Test files
│   └── requirements.txt
├── frontend/         # React frontend
│   ├── src/          # Source code
│   ├── public/       # Static files
│   └── package.json
├── docker-compose.yml # Infrastructure setup
└── README.md
```

### Development Workflow

1. **Backend Development**
   ```bash
   cd backend
   source venv/bin/activate
   # Make changes to code
   uvicorn app.main:app --reload
   ```

2. **Frontend Development**
   ```bash
   cd frontend
   npm start
   # Make changes to code
   # Hot reload will automatically apply changes
   ```

3. **Database Changes**
   ```bash
   cd backend
   # Create new migration
   alembic revision --autogenerate -m "Description"
   # Apply migration
   alembic upgrade head
   ```

### Code Style

- **Python**: Follow PEP 8 guidelines
- **TypeScript**: Use strict mode and proper typing
- **React**: Use functional components with hooks
- **Testing**: Maintain good test coverage

## Testing

### Backend Testing

```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```

### Frontend Testing

```bash
cd frontend
npm test
```

### API Testing

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test authentication
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

### Integration Testing

```bash
# Run all tests
cd backend && pytest tests/ -v
cd ../frontend && npm test -- --watchAll=false
```

## Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   # Set production environment
   export ENVIRONMENT=production
   export DEBUG=False
   ```

2. **Database Migration**
   ```bash
   cd backend
   alembic upgrade head
   ```

3. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

4. **Start Services**
   ```bash
   # Backend
   cd backend
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker

   # Frontend (serve static files)
   npx serve -s build -l 3000
   ```

### Docker Deployment

```bash
# Build and run with Docker
docker-compose -f docker-compose.prod.yml up --build
```

### Cloud Deployment

The application is configured for deployment on:
- **Render**: Backend deployment
- **Firebase**: Frontend hosting
- **Vercel**: Alternative frontend hosting

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps
   # Restart database
   docker-compose restart db
   ```

2. **Redis Connection Error**
   ```bash
   # Check Redis status
   docker-compose logs redis
   # Restart Redis
   docker-compose restart redis
   ```

3. **API Key Issues**
   - Verify Perplexity API key is correct
   - Check environment variables are loaded
   - Ensure API key has proper permissions

4. **Frontend Build Errors**
   ```bash
   # Clear node modules and reinstall
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

5. **Backend Import Errors**
   ```bash
   # Reinstall dependencies
   cd backend
   pip install -r requirements.txt
   ```

### Performance Issues

1. **Slow API Responses**
   - Check Redis cache status
   - Monitor database connection pool
   - Review API rate limits

2. **Memory Issues**
   - Monitor system resources
   - Check for memory leaks
   - Optimize database queries

### Debug Mode

Enable debug mode for detailed error messages:

```bash
export DEBUG=True
export ENVIRONMENT=development
```

## Contributing

### Development Setup

1. **Fork the Repository**
2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make Changes**
4. **Run Tests**
   ```bash
   cd backend && pytest tests/
   cd ../frontend && npm test
   ```
5. **Commit Changes**
   ```bash
   git commit -m "Add your feature description"
   ```
6. **Push to Branch**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create Pull Request**

### Code Standards

- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure all tests pass
- Review security implications

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## Acknowledgments

- **Perplexity AI** for providing the AI analysis capabilities
- **FastAPI** community for excellent documentation
- **React** team for the powerful frontend framework
- **Tailwind CSS** for the beautiful design system

---

**BrandRanker** - Empowering intelligent brand analysis through AI