#!/bin/bash

# Brand Ranker - Application Startup Script
# This script sets up and starts the entire application

set -e  # Exit on any error

echo "🚀 Brand Ranker - Starting Application"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_status "Docker is running"
}

# Check if required files exist
check_environment() {
    if [ ! -f "backend/.env" ]; then
        print_warning "Environment file not found. Creating from template..."
        if [ -f ".env.example" ]; then
            cp .env.example backend/.env
            print_warning "Please edit backend/.env with your OpenAI API key and database credentials"
        else
            print_error "No .env.example found. Please create backend/.env manually"
            exit 1
        fi
    fi
}

# Start infrastructure services
start_infrastructure() {
    print_info "Starting infrastructure services..."
    
    # Start database and Redis
    docker-compose up -d db redis
    
    # Wait for services to be ready
    print_info "Waiting for database to be ready..."
    sleep 5
    
    print_status "Infrastructure services started"
}

# Setup Python environment
setup_backend() {
    print_info "Setting up backend environment..."
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        print_info "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    print_info "Installing Python dependencies..."
    cd backend
    pip install -r requirements.txt
    cd ..
    
    print_status "Backend environment ready"
}

# Setup Node.js environment
setup_frontend() {
    print_info "Setting up frontend environment..."
    
    cd frontend
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_info "Installing Node.js dependencies..."
        npm install
    fi
    
    cd ..
    
    print_status "Frontend environment ready"
}

# Start backend server
start_backend() {
    print_info "Starting backend server..."
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Start backend in background
    cd backend
    uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    print_info "Waiting for backend to start..."
    sleep 3
    
    # Check if backend is running
    if curl -s http://localhost:8000/health > /dev/null; then
        print_status "Backend server started (PID: $BACKEND_PID)"
    else
        print_error "Backend server failed to start"
        exit 1
    fi
}

# Start frontend server
start_frontend() {
    print_info "Starting frontend server..."
    
    cd frontend
    
    # Start frontend in background
    npm start &
    FRONTEND_PID=$!
    cd ..
    
    # Wait for frontend to start
    print_info "Waiting for frontend to start..."
    sleep 10
    
    print_status "Frontend server started (PID: $FRONTEND_PID)"
}

# Main execution
main() {
    echo ""
    print_info "Checking prerequisites..."
    check_docker
    check_environment
    
    echo ""
    print_info "Starting infrastructure..."
    start_infrastructure
    
    echo ""
    print_info "Setting up environments..."
    setup_backend
    setup_frontend
    
    echo ""
    print_info "Starting application servers..."
    start_backend
    start_frontend
    
    echo ""
    echo "🎉 Brand Ranker is now running!"
    echo "======================================"
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend:  http://localhost:8000"
    echo "📚 API Docs: http://localhost:8000/docs"
    echo "📊 Health:   http://localhost:8000/health"
    echo ""
    echo "To stop the application, press Ctrl+C"
    echo ""
    
    # Save PIDs for cleanup
    echo $BACKEND_PID > .backend.pid
    echo $FRONTEND_PID > .frontend.pid
    
    # Wait for user to stop
    wait
}

# Cleanup function
cleanup() {
    echo ""
    print_info "Stopping application servers..."
    
    # Kill background processes
    if [ -f ".backend.pid" ]; then
        BACKEND_PID=$(cat .backend.pid)
        kill $BACKEND_PID 2>/dev/null || true
        rm .backend.pid
    fi
    
    if [ -f ".frontend.pid" ]; then
        FRONTEND_PID=$(cat .frontend.pid)
        kill $FRONTEND_PID 2>/dev/null || true
        rm .frontend.pid
    fi
    
    print_status "Application stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Run main function
main 