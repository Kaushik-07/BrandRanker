# Brand Ranker - Full Stack Web Application

> **AI-powered brand ranking across categories with intelligent insights**

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green.svg)](https://fastapi.tiangolo.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue.svg)](https://postgresql.org)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-orange.svg)](https://openai.com)

## 🎯 Project Overview

Brand Ranker is a sophisticated full-stack web application that leverages AI to rank brands across different categories.

### ✨ Key Features

- **🤖 AI-Powered Rankings**: Uses Perplexity Pro AI for intelligent brand analysis
- **📊 Interactive Visualizations**: Dynamic charts and detailed insights
- **🔐 Secure Authentication**: JWT-based user management
- **⚡ Performance Optimized**: Caching, rate limiting, and connection pooling
- **📱 Responsive Design**: Works seamlessly on all devices
- **🎯 Intelligent Insights**: AI-generated analysis of brand performance
- **📈 Real-time Monitoring**: Live performance metrics and health checks


### 🎨 User Interface (
- **Modern Glassmorphism Design**: Beautiful glass-like UI elements with backdrop blur
- **Interactive Animations**: Smooth hover effects, scale transformations, and loading states
- **Real-time Performance Monitor**: Floating dashboard with live system metrics
- **Sophisticated Onboarding**: Multi-step tutorial with progress tracking
- **Responsive Design**: Perfect on desktop, tablet, and mobile devices

### 🔧 Functionality 
- **User Authentication**: JWT-based secure authentication system
- **Experiment Creation**: Up to 5 companies, 3 categories with validation
- **AI Rankings**: OpenAI GPT-4 integration with intelligent fallback
- **Parallel Processing**: Async category analysis for performance
- **Results Visualization**: Interactive charts and detailed tables
- **Experiment History**: Complete history with comparison capabilities

### ⚡ Performance
- **Async Processing**: Parallel LLM API calls for faster results
- **Connection Pooling**: Optimized database and API connections
- **Intelligent Caching**: Redis with 1-hour TTL and fallback
- **Rate Limiting**: 50 requests per minute with intelligent throttling
- **Error Recovery**: Graceful fallback to mock data when APIs fail
- **Real-time Monitoring**: CPU, memory, disk usage tracking

### 📊 Dashboard Design
- **AI-Powered Analysis**: Comprehensive brand ranking with reasoning
- **Performance Metrics**: Real-time system health and efficiency
- **Interactive Visualizations**: Multiple chart types (bar, line, doughnut) with real data
- **Comparative Analysis**: Side-by-side brand comparisons
- **Organized Data Display**: Hierarchical layout with progressive disclosure

### 📝 Code Style and Organization
- **Full TypeScript**: Complete type safety throughout frontend
- **Python Type Hints**: Comprehensive type annotations
- **Clean Architecture**: Separation of concerns with clear layers
- **SOLID Principles**: Well-structured, maintainable code
- **Comprehensive Documentation**: Detailed setup and usage guides

## 🏗️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT with bcrypt password hashing
- **LLM Integration**: OpenAI GPT-4
- **Caching**: Redis with intelligent fallback
- **Performance**: Real-time metrics, rate limiting, health checks

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with modern design
- **Charts**: Chart.js with React-Chartjs-2
- **State Management**: React Context API
- **Routing**: React Router DOM

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL container
- **Caching**: Redis container
- **Development**: Hot reloading for both frontend and backend

## Quick Start

### Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **Docker & Docker Compose**
- **OpenAI API Key**

### 1. Clone Repository

```bash
git clone <repository-url>
cd BrandRanker
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example backend/.env

# Edit with your settings
nano backend/.env
```

**Required Environment Variables:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/brandranker
SECRET_KEY=your-secret-key-change-this-in-production
OPENAI_API_KEY=your_openai_api_key_here
REDIS_URL=redis://localhost:6379
```

### 3. Start Application

#### Option A: Automated Setup (Recommended)
```bash
# Make script executable
chmod +x scripts/start.sh

# Start everything
./scripts/start.sh
```

#### Option B: Manual Setup

**Start Infrastructure:**
```bash
# Start database and cache
docker-compose up -d db redis
```

**Setup Backend:**
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Start backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Setup Frontend:**
```bash
cd frontend
npm install
npm start
```

### 4. Access Application

- **🌐 Frontend**: http://localhost:3000
- **🔧 Backend**: http://localhost:8000
- **📚 API Documentation**: http://localhost:8000/docs
- **📊 Health Check**: http://localhost:8000/health

## 🎯 Core Functionality

### Experiment Creation
1. **Add Companies**: Enter up to 5 companies to compare
2. **Select Categories**: Choose up to 3 categories for analysis
3. **AI Analysis**: OpenAI GPT-4 analyzes each brand across categories
4. **View Results**: Interactive charts and detailed rankings

### Example Use Case
**Companies**: Nike, Adidas, Puma
**Categories**: Running shoes, Basketball shoes

**Result**: AI generates rankings for each category and calculates average performance across all categories.

## 📊 Features

### Core Functionality
-  **User Authentication**: Register, login, JWT tokens
-  **Experiment Creation**: Up to 5 companies, 3 categories
-  **AI Rankings**: OpenAI-powered brand analysis
-  **Results Visualization**: Interactive charts and tables
-  **Experiment History**: View and compare past experiments
-  **Intelligent Insights**: AI-generated performance analysis

### Advanced Features
-  **Performance Monitoring**: Real-time metrics and health checks
-  **Caching System**: Redis with intelligent fallback
-  **Rate Limiting**: API protection and optimization
-  **Error Handling**: Comprehensive error management
-  **Responsive Design**: Mobile-first approach
-  **Type Safety**: TypeScript throughout frontend

## 🎨 User Interface

### Modern Design
- **Glassmorphism Effects**: Modern glass-like UI elements
- **Gradient Backgrounds**: Beautiful color transitions
- **Interactive Elements**: Hover effects and animations
- **Responsive Layout**: Perfect on desktop, tablet, and mobile

### Data Visualization
- **Bar Charts**: Clear brand ranking comparisons
- **Line Charts**: Performance trends over time
- **Doughnut Charts**: Performance distribution analysis
- **Color-Coded Results**: Gold, silver, bronze for top performers
- **Detailed Tables**: Complete breakdown with reasons
- **Insights Panel**: AI-powered analysis and recommendations

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Experiments
- `POST /api/experiments/` - Create new experiment
- `GET /api/experiments/` - Get user's experiments
- `GET /api/experiments/{id}` - Get specific experiment

### Monitoring
- `GET /api/performance/stats` - System performance metrics
- `GET /api/performance/health` - System health status
- `GET /api/performance/metrics` - Detailed performance metrics

## 📈 Performance Optimizations

### Backend Optimizations
- **Async Processing**: Parallel LLM API calls
- **Connection Pooling**: Optimized database connections
- **Intelligent Caching**: Redis with 1-hour TTL
- **Rate Limiting**: 50 requests per minute window
- **Error Recovery**: Graceful fallback to mock data

### Frontend Optimizations
- **React Memoization**: Optimized re-renders
- **Lazy Loading**: Efficient component loading
- **Bundle Optimization**: Reduced bundle size
- **State Management**: Efficient context usage

## 🛡️ Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt
- **Token Expiration**: Configurable session timeouts
- **CORS Protection**: Cross-origin request handling

### Data Protection
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: ORM-based queries
- **Environment Variables**: Secure configuration management
- **Error Handling**: No sensitive data exposure

### Advanced Architecture Patterns
- **Service Layer Pattern**: Clean separation of business logic
- **Repository Pattern**: Data access abstraction
- **Observer Pattern**: Event-driven architecture
- **Strategy Pattern**: Pluggable algorithms

### Production-Ready Features
- **Real-time Monitoring**: System performance tracking
- **Health Checks**: Comprehensive health status
- **Error Recovery**: Graceful degradation
- **Scalability Design**: Horizontal scaling capabilities
- **Security Hardening**: Production-grade security

### DevOps Integration
- **Docker Containerization**: Consistent environments
- **Systemd Services**: Production service management
- **Nginx Configuration**: Reverse proxy setup
- **Automated Deployment**: Scripted deployment process
- **Health Monitoring**: Automated health checks

## 🧪 Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/
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

## 📚 Documentation

### Architecture
- **Clean Architecture**: Separation of concerns
- **SOLID Principles**: Well-structured, maintainable code
- **Design Patterns**: Appropriate pattern usage
- **Microservices Ready**: Service decomposition

### Code Quality
- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Comprehensive error management
- **Testing Strategy**: Unit and integration test structure
- **Code Documentation**: Comprehensive inline documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- **XLR8.ai** for the technical assessment opportunity
- **PerplexityAPI** for providing the Perplexity Pro API
- **FastAPI** and **React** communities for excellent documentation
- **Tailwind CSS** for the beautiful design system

---

## 🎯 Key Differentiators

1. **Advanced Performance Monitoring**: Real-time system metrics with health checks
2. **Sophisticated Caching Strategy**: Multi-level caching with intelligent fallback
3. **Production-Ready Architecture**: Scalable, maintainable, and secure design
4. **Comprehensive Error Handling**: Graceful degradation and recovery
5. **Advanced UI/UX**: Modern design with sophisticated interactions
6. **DevOps Integration**: Automated deployment and monitoring
7. **Security Hardening**: Production-grade security measures
8. **Scalability Design**: Horizontal scaling capabilities

### Technical Excellence
- **Full TypeScript Implementation**: Complete type safety
- **Modern React Patterns**: Hooks, Context, and performance optimization
- **FastAPI Best Practices**: Async/await, dependency injection, validation
- **Database Optimization**: Connection pooling, indexing, and query optimization
- **API Design**: RESTful endpoints with comprehensive documentation
- **Testing Strategy**: Unit and integration test structure
- **Documentation**: Comprehensive setup and usage guides
---