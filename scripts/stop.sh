#!/bin/bash

# Brand Ranker - Application Stop Script
# This script stops the application and cleans up processes

echo "🛑 Brand Ranker - Stopping Application"
echo "======================================"

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

# Stop backend server
stop_backend() {
    print_info "Stopping backend server..."
    
    # Kill by PID if available
    if [ -f ".backend.pid" ]; then
        BACKEND_PID=$(cat .backend.pid)
        kill $BACKEND_PID 2>/dev/null || true
        rm .backend.pid
        print_status "Backend server stopped"
    else
        # Kill by port if PID file not found
        BACKEND_PID=$(lsof -ti:8000 2>/dev/null || true)
        if [ ! -z "$BACKEND_PID" ]; then
            kill $BACKEND_PID
            print_status "Backend server stopped"
        else
            print_warning "No backend server found running"
        fi
    fi
}

# Stop frontend server
stop_frontend() {
    print_info "Stopping frontend server..."
    
    # Kill by PID if available
    if [ -f ".frontend.pid" ]; then
        FRONTEND_PID=$(cat .frontend.pid)
        kill $FRONTEND_PID 2>/dev/null || true
        rm .frontend.pid
        print_status "Frontend server stopped"
    else
        # Kill by port if PID file not found
        FRONTEND_PID=$(lsof -ti:3000 2>/dev/null || true)
        if [ ! -z "$FRONTEND_PID" ]; then
            kill $FRONTEND_PID
            print_status "Frontend server stopped"
        else
            print_warning "No frontend server found running"
        fi
    fi
}

# Stop infrastructure services
stop_infrastructure() {
    print_info "Stopping infrastructure services..."
    
    # Stop Docker containers
    docker-compose down 2>/dev/null || true
    
    print_status "Infrastructure services stopped"
}

# Clean up temporary files
cleanup() {
    print_info "Cleaning up temporary files..."
    
    # Remove PID files
    rm -f .backend.pid .frontend.pid
    
    # Remove Python cache
    find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find . -name "*.pyc" -delete 2>/dev/null || true
    
    print_status "Cleanup completed"
}

# Main execution
main() {
    stop_backend
    stop_frontend
    stop_infrastructure
    cleanup
    
    echo ""
    print_status "Application stopped successfully!"
    echo ""
}

main 