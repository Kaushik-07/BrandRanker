#!/bin/bash

# Brand Ranker - Production Deployment Script
# This script sets up the entire application for production deployment

set -e  # Exit on any error

echo "🚀 Brand Ranker - Production Deployment"
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

# Check if running as root
check_root() {
    if [ "$EUID" -eq 0 ]; then
        print_error "Please don't run this script as root"
        exit 1
    fi
}

# Check system requirements
check_system() {
    print_info "Checking system requirements..."
    
    # Check OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_status "Linux detected"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        print_status "macOS detected"
    else
        print_warning "Unsupported OS: $OSTYPE"
    fi
    
    # Check available memory
    if command -v free >/dev/null 2>&1; then
        MEMORY_KB=$(free | awk '/^Mem:/{print $2}')
        MEMORY_GB=$((MEMORY_KB / 1024 / 1024))
        if [ $MEMORY_GB -lt 2 ]; then
            print_warning "Low memory detected: ${MEMORY_GB}GB (recommended: 2GB+)"
        else
            print_status "Memory: ${MEMORY_GB}GB"
        fi
    fi
    
    # Check disk space
    DISK_SPACE=$(df . | awk 'NR==2 {print $4}')
    DISK_SPACE_GB=$((DISK_SPACE / 1024 / 1024))
    if [ $DISK_SPACE_GB -lt 5 ]; then
        print_warning "Low disk space: ${DISK_SPACE_GB}GB (recommended: 5GB+)"
    else
        print_status "Disk space: ${DISK_SPACE_GB}GB"
    fi
}

# Install system dependencies
install_system_deps() {
    print_info "Installing system dependencies..."
    
    if command -v apt-get >/dev/null 2>&1; then
        # Ubuntu/Debian
        sudo apt-get update
        sudo apt-get install -y python3 python3-pip python3-venv nodejs npm docker.io docker-compose
    elif command -v yum >/dev/null 2>&1; then
        # CentOS/RHEL
        sudo yum update -y
        sudo yum install -y python3 python3-pip nodejs npm docker docker-compose
    elif command -v brew >/dev/null 2>&1; then
        # macOS
        brew update
        brew install python3 node docker docker-compose
    else
        print_warning "Package manager not detected. Please install Python 3.8+, Node.js 16+, and Docker manually."
    fi
}

# Setup environment
setup_environment() {
    print_info "Setting up environment..."
    
    # Create .env file if it doesn't exist
    if [ ! -f "backend/.env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example backend/.env
            print_warning "Created backend/.env from template. Please edit with your API keys."
        else
            print_error "No .env.example found. Please create backend/.env manually."
            exit 1
        fi
    fi
    
    # Generate secret key if not present
    if ! grep -q "SECRET_KEY" backend/.env; then
        SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
        echo "SECRET_KEY=$SECRET_KEY" >> backend/.env
        print_status "Generated SECRET_KEY"
    fi
}

# Setup Python environment
setup_python() {
    print_info "Setting up Python environment..."
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_status "Created Python virtual environment"
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Upgrade pip
    pip install --upgrade pip
    
    # Install Python dependencies
    cd backend
    pip install -r requirements.txt
    cd ..
    
    print_status "Python environment ready"
}

# Setup Node.js environment
setup_nodejs() {
    print_info "Setting up Node.js environment..."
    
    cd frontend
    
    # Install dependencies
    npm install
    
    # Build for production
    npm run build
    
    cd ..
    
    print_status "Node.js environment ready"
}

# Setup Docker services
setup_docker() {
    print_info "Setting up Docker services..."
    
    # Start infrastructure services
    docker-compose up -d db redis
    
    # Wait for services to be ready
    print_info "Waiting for services to be ready..."
    sleep 10
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        print_status "Docker services started"
    else
        print_error "Failed to start Docker services"
        exit 1
    fi
}

# Setup database
setup_database() {
    print_info "Setting up database..."
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Create database tables
    cd backend
    python -c "
from app.core.database import engine
from app.models import Base
Base.metadata.create_all(bind=engine)
print('Database tables created')
"
    cd ..
    
    print_status "Database setup complete"
}

# Create systemd service files
create_services() {
    print_info "Creating systemd services..."
    
    # Create backend service
    sudo tee /etc/systemd/system/brandranker-backend.service > /dev/null <<EOF
[Unit]
Description=Brand Ranker Backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
Environment=PATH=$(pwd)/venv/bin
ExecStart=$(pwd)/venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    # Create frontend service
    sudo tee /etc/systemd/system/brandranker-frontend.service > /dev/null <<EOF
[Unit]
Description=Brand Ranker Frontend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)/frontend
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    # Reload systemd
    sudo systemctl daemon-reload
    
    print_status "Systemd services created"
}

# Start services
start_services() {
    print_info "Starting services..."
    
    # Enable and start services
    sudo systemctl enable brandranker-backend
    sudo systemctl enable brandranker-frontend
    sudo systemctl start brandranker-backend
    sudo systemctl start brandranker-frontend
    
    # Wait for services to start
    sleep 5
    
    # Check service status
    if sudo systemctl is-active --quiet brandranker-backend; then
        print_status "Backend service started"
    else
        print_error "Backend service failed to start"
        sudo systemctl status brandranker-backend
    fi
    
    if sudo systemctl is-active --quiet brandranker-frontend; then
        print_status "Frontend service started"
    else
        print_error "Frontend service failed to start"
        sudo systemctl status brandranker-frontend
    fi
}

# Setup nginx (optional)
setup_nginx() {
    read -p "Do you want to setup nginx as reverse proxy? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Setting up nginx..."
        
        # Install nginx
        if command -v apt-get >/dev/null 2>&1; then
            sudo apt-get install -y nginx
        elif command -v yum >/dev/null 2>&1; then
            sudo yum install -y nginx
        fi
        
        # Create nginx config
        sudo tee /etc/nginx/sites-available/brandranker > /dev/null <<EOF
server {
    listen 80;
    server_name localhost;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

        # Enable site
        sudo ln -sf /etc/nginx/sites-available/brandranker /etc/nginx/sites-enabled/
        sudo nginx -t
        sudo systemctl restart nginx
        
        print_status "Nginx configured"
    fi
}

# Health check
health_check() {
    print_info "Performing health check..."
    
    # Check backend
    if curl -s http://localhost:8000/health > /dev/null; then
        print_status "Backend health check passed"
    else
        print_error "Backend health check failed"
    fi
    
    # Check frontend
    if curl -s http://localhost:3000 > /dev/null; then
        print_status "Frontend health check passed"
    else
        print_error "Frontend health check failed"
    fi
    
    # Check database
    if docker-compose exec -T db pg_isready -U user -d brandranker > /dev/null 2>&1; then
        print_status "Database health check passed"
    else
        print_error "Database health check failed"
    fi
}

# Main execution
main() {
    echo ""
    print_info "Starting production deployment..."
    
    check_root
    check_system
    install_system_deps
    setup_environment
    setup_python
    setup_nodejs
    setup_docker
    setup_database
    create_services
    start_services
    setup_nginx
    health_check
    
    echo ""
    echo "🎉 Brand Ranker deployment completed!"
    echo "======================================"
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend:  http://localhost:8000"
    echo "📚 API Docs: http://localhost:8000/docs"
    echo "📊 Health:   http://localhost:8000/health"
    echo ""
    echo "Service Management:"
    echo "  sudo systemctl status brandranker-backend"
    echo "  sudo systemctl status brandranker-frontend"
    echo "  sudo systemctl restart brandranker-backend"
    echo "  sudo systemctl restart brandranker-frontend"
    echo ""
    echo "Logs:"
    echo "  sudo journalctl -u brandranker-backend -f"
    echo "  sudo journalctl -u brandranker-frontend -f"
    echo ""
    echo "Don't forget to:"
    echo "  1. Edit backend/.env with your API keys"
    echo "  2. Configure your domain in nginx if using"
    echo "  3. Set up SSL certificates for production"
    echo ""
}

# Run main function
main 