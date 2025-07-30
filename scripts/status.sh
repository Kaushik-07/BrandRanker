#!/bin/bash

# Brand Ranker - Application Status Script
# This script checks the status of all application components

echo "📊 Brand Ranker - Application Status"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check Docker status
check_docker() {
    print_info "Checking Docker status..."
    
    if docker info > /dev/null 2>&1; then
        print_status "Docker is running"
        
        # Check if containers are running
        if docker ps | grep -q "brandranker"; then
            print_status "Docker containers are running"
        else
            print_warning "Docker containers are not running"
        fi
    else
        print_error "Docker is not running"
    fi
}

# Check backend status
check_backend() {
    print_info "Checking backend status..."
    
    if curl -s http://localhost:8000/health > /dev/null; then
        print_status "Backend server is running (http://localhost:8000)"
        
        # Check API endpoints
        if curl -s http://localhost:8000/docs > /dev/null; then
            print_status "API documentation is available"
        else
            print_warning "API documentation not accessible"
        fi
    else
        print_error "Backend server is not running"
    fi
}

# Check frontend status
check_frontend() {
    print_info "Checking frontend status..."
    
    if curl -s http://localhost:3000 > /dev/null; then
        print_status "Frontend server is running (http://localhost:3000)"
    else
        print_error "Frontend server is not running"
    fi
}

# Check database status
check_database() {
    print_info "Checking database status..."
    
    # Check if PostgreSQL container is running
    if docker ps | grep -q "postgres"; then
        print_status "PostgreSQL container is running"
    else
        print_error "PostgreSQL container is not running"
    fi
}

# Check Redis status
check_redis() {
    print_info "Checking Redis status..."
    
    # Check if Redis container is running
    if docker ps | grep -q "redis"; then
        print_status "Redis container is running"
    else
        print_error "Redis container is not running"
    fi
}

# Check environment files
check_environment() {
    print_info "Checking environment configuration..."
    
    if [ -f "backend/.env" ]; then
        print_status "Environment file exists"
        
        # Check if OpenAI API key is set
        if grep -q "OPENAI_API_KEY" backend/.env; then
            print_status "OpenAI API key is configured"
        else
            print_warning "OpenAI API key not found in .env"
        fi
    else
        print_error "Environment file not found"
    fi
}

# Check Python virtual environment
check_python_env() {
    print_info "Checking Python environment..."
    
    if [ -d "venv" ]; then
        print_status "Python virtual environment exists"
    else
        print_warning "Python virtual environment not found"
    fi
}

# Check Node.js dependencies
check_node_deps() {
    print_info "Checking Node.js dependencies..."
    
    if [ -d "frontend/node_modules" ]; then
        print_status "Node.js dependencies are installed"
    else
        print_warning "Node.js dependencies not installed"
    fi
}

# Check process status
check_processes() {
    print_info "Checking application processes..."
    
    # Check backend process
    BACKEND_PID=$(lsof -ti:8000 2>/dev/null || true)
    if [ ! -z "$BACKEND_PID" ]; then
        print_status "Backend process running (PID: $BACKEND_PID)"
    else
        print_error "Backend process not running"
    fi
    
    # Check frontend process
    FRONTEND_PID=$(lsof -ti:3000 2>/dev/null || true)
    if [ ! -z "$FRONTEND_PID" ]; then
        print_status "Frontend process running (PID: $FRONTEND_PID)"
    else
        print_error "Frontend process not running"
    fi
}

# Generate summary
generate_summary() {
    echo ""
    echo "📋 Status Summary"
    echo "================="
    
    # Count running services
    RUNNING_SERVICES=0
    TOTAL_SERVICES=6
    
    if curl -s http://localhost:8000/health > /dev/null; then
        ((RUNNING_SERVICES++))
    fi
    
    if curl -s http://localhost:3000 > /dev/null; then
        ((RUNNING_SERVICES++))
    fi
    
    if docker ps | grep -q "postgres"; then
        ((RUNNING_SERVICES++))
    fi
    
    if docker ps | grep -q "redis"; then
        ((RUNNING_SERVICES++))
    fi
    
    if [ -f "backend/.env" ]; then
        ((RUNNING_SERVICES++))
    fi
    
    if [ -d "venv" ]; then
        ((RUNNING_SERVICES++))
    fi
    
    echo "Services running: $RUNNING_SERVICES/$TOTAL_SERVICES"
    
    if [ $RUNNING_SERVICES -eq $TOTAL_SERVICES ]; then
        print_status "All services are running!"
    elif [ $RUNNING_SERVICES -gt 0 ]; then
        print_warning "Some services are running"
    else
        print_error "No services are running"
    fi
}

# Main execution
main() {
    check_docker
    check_database
    check_redis
    check_backend
    check_frontend
    check_environment
    check_python_env
    check_node_deps
    check_processes
    generate_summary
}

main 