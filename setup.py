#!/usr/bin/env python3
"""
BrandRanker Setup Script
Automated setup and startup for the BrandRanker application
"""

import os
import sys
import subprocess
import time
import signal
import platform
from pathlib import Path
import json

class BrandRankerSetup:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.backend_dir = self.project_root / "backend"
        self.frontend_dir = self.project_root / "frontend"
        self.processes = []
        
    def print_status(self, message, status="INFO"):
        """Print formatted status messages"""
        colors = {
            "INFO": "\033[94m",    # Blue
            "SUCCESS": "\033[92m", # Green
            "WARNING": "\033[93m", # Yellow
            "ERROR": "\033[91m",   # Red
            "RESET": "\033[0m"     # Reset
        }
        print(f"{colors.get(status, colors['INFO'])}[{status}] {message}{colors['RESET']}")
    
    def check_prerequisites(self):
        """Check if required software is installed"""
        self.print_status("Checking prerequisites...")
        
        # Check Python version
        python_version = sys.version_info
        if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
            self.print_status("Python 3.8+ is required", "ERROR")
            return False
        
        self.print_status(f"Python {python_version.major}.{python_version.minor}.{python_version.micro} ✓")
        
        # Check Node.js
        try:
            node_result = subprocess.run(["node", "--version"], capture_output=True, text=True)
            if node_result.returncode == 0:
                self.print_status(f"Node.js {node_result.stdout.strip()} ✓")
            else:
                self.print_status("Node.js not found", "ERROR")
                return False
        except FileNotFoundError:
            self.print_status("Node.js not found", "ERROR")
            return False
        
        # Check npm
        try:
            npm_result = subprocess.run(["npm", "--version"], capture_output=True, text=True)
            if npm_result.returncode == 0:
                self.print_status(f"npm {npm_result.stdout.strip()} ✓")
            else:
                self.print_status("npm not found", "ERROR")
                return False
        except FileNotFoundError:
            self.print_status("npm not found", "ERROR")
            return False
        
        # Check Docker
        try:
            docker_result = subprocess.run(["docker", "--version"], capture_output=True, text=True)
            if docker_result.returncode == 0:
                self.print_status("Docker ✓")
            else:
                self.print_status("Docker not found", "WARNING")
        except FileNotFoundError:
            self.print_status("Docker not found", "WARNING")
        
        # Check Docker Compose
        try:
            compose_result = subprocess.run(["docker-compose", "--version"], capture_output=True, text=True)
            if compose_result.returncode == 0:
                self.print_status("Docker Compose ✓")
            else:
                self.print_status("Docker Compose not found", "WARNING")
        except FileNotFoundError:
            self.print_status("Docker Compose not found", "WARNING")
        
        return True
    
    def setup_backend_environment(self):
        """Setup backend Python environment"""
        self.print_status("Setting up backend environment...")
        
        # Use the current Python executable (from the active venv)
        python_executable = sys.executable
        pip_executable = python_executable.replace("python", "pip")
        
        # Install requirements
        self.print_status("Installing Python dependencies...")
        requirements_file = self.backend_dir / "requirements.txt"
        if requirements_file.exists():
            subprocess.run([pip_executable, "install", "-r", str(requirements_file)], check=True)
        
        return python_executable
    
    def setup_frontend_environment(self):
        """Setup frontend Node.js environment"""
        self.print_status("Setting up frontend environment...")
        
        # Install npm dependencies
        self.print_status("Installing Node.js dependencies...")
        subprocess.run(["npm", "install"], cwd=self.frontend_dir, check=True)
    
    def create_env_file(self):
        """Create backend environment file if it doesn't exist"""
        env_file = self.backend_dir / ".env"
        if not env_file.exists():
            self.print_status("Creating backend environment file...")
            
            env_content = """# Database Configuration
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
"""
            
            with open(env_file, 'w') as f:
                f.write(env_content)
            
            self.print_status("Environment file created. Please update PERPLEXITY_API_KEY in backend/.env", "WARNING")
    
    def start_infrastructure(self):
        """Start PostgreSQL and Redis using Docker"""
        self.print_status("Starting infrastructure services...")
        
        try:
            # Start services in background
            subprocess.run(["docker-compose", "up", "-d", "db", "redis"], check=True)
            
            # Wait for services to be ready
            self.print_status("Waiting for services to be ready...")
            time.sleep(15)
            
            # Check if services are running
            result = subprocess.run(["docker-compose", "ps"], capture_output=True, text=True)
            if "Up" in result.stdout:
                self.print_status("Infrastructure services started successfully ✓")
                return True
            else:
                self.print_status("Failed to start infrastructure services", "ERROR")
                return False
                
        except subprocess.CalledProcessError as e:
            self.print_status(f"Failed to start infrastructure: {e}", "ERROR")
            return False
        except FileNotFoundError:
            self.print_status("Docker Compose not found. Please install Docker and Docker Compose.", "ERROR")
            return False
    
    def setup_database(self):
        """Setup database migrations"""
        self.print_status("Setting up database...")
        
        try:
            # Use the current Python executable (from the active venv)
            python_executable = sys.executable
            pip_executable = python_executable.replace("python", "pip")
            
            # First, ensure required packages are installed
            self.print_status("Installing database dependencies...")
            
            # Install psycopg2-binary for PostgreSQL connection
            subprocess.run([pip_executable, "install", "psycopg2-binary==2.9.9"], check=True)
            
            # Install alembic
            subprocess.run([pip_executable, "install", "alembic==1.13.1"], check=True)
            
            # Run alembic migrations
            self.print_status("Running database migrations...")
            subprocess.run([python_executable, "-m", "alembic", "upgrade", "head"], 
                         cwd=self.backend_dir, check=True)
            
            self.print_status("Database setup completed ✓")
            return True
            
        except subprocess.CalledProcessError as e:
            self.print_status(f"Database setup failed: {e}", "ERROR")
            return False
    
    def start_backend(self):
        """Start the FastAPI backend server"""
        self.print_status("Starting backend server...")
        
        try:
            # Use the current Python executable (from the active venv)
            python_executable = sys.executable
            
            # Start uvicorn server
            process = subprocess.Popen([
                python_executable, "-m", "uvicorn", "app.main:app", 
                "--reload", "--host", "0.0.0.0", "--port", "8000"
            ], cwd=self.backend_dir)
            
            self.processes.append(("Backend", process))
            self.print_status("Backend server started ✓")
            return True
            
        except Exception as e:
            self.print_status(f"Failed to start backend: {e}", "ERROR")
            return False
    
    def start_frontend(self):
        """Start the React frontend server"""
        self.print_status("Starting frontend server...")
        
        try:
            # Start React development server
            process = subprocess.Popen(["npm", "start"], cwd=self.frontend_dir)
            
            self.processes.append(("Frontend", process))
            self.print_status("Frontend server started ✓")
            return True
            
        except Exception as e:
            self.print_status(f"Failed to start frontend: {e}", "ERROR")
            return False
    
    def wait_for_services(self):
        """Wait for services to be ready"""
        self.print_status("Waiting for services to be ready...")
        time.sleep(10)
    
    def cleanup(self):
        """Cleanup processes on exit"""
        self.print_status("Stopping all services...")
        
        for name, process in self.processes:
            try:
                process.terminate()
                process.wait(timeout=5)
                self.print_status(f"{name} stopped ✓")
            except subprocess.TimeoutExpired:
                process.kill()
                self.print_status(f"{name} force killed ✓")
            except Exception as e:
                self.print_status(f"Error stopping {name}: {e}", "WARNING")
        
        # Stop Docker services
        try:
            subprocess.run(["docker-compose", "down"], check=True)
            self.print_status("Infrastructure services stopped ✓")
        except Exception as e:
            self.print_status(f"Error stopping infrastructure: {e}", "WARNING")
    
    def run(self):
        """Main setup and startup process"""
        try:
            self.print_status("🚀 Starting BrandRanker Setup", "SUCCESS")
            
            # Check prerequisites
            if not self.check_prerequisites():
                self.print_status("Prerequisites check failed", "ERROR")
                return False
            
            # Setup environments
            self.setup_backend_environment()
            self.setup_frontend_environment()
            
            # Create environment file
            self.create_env_file()
            
            # Start infrastructure
            if not self.start_infrastructure():
                self.print_status("Infrastructure setup failed", "ERROR")
                return False
            
            # Setup database
            if not self.setup_database():
                self.print_status("Database setup failed", "ERROR")
                return False
            
            # Start application servers
            if not self.start_backend():
                return False
            
            if not self.start_frontend():
                return False
            
            # Wait for services
            self.wait_for_services()
            
            # Print success message
            self.print_status("🎉 BrandRanker is now running!", "SUCCESS")
            self.print_status("🌐 Frontend: http://localhost:3000", "INFO")
            self.print_status("🔧 Backend: http://localhost:8000", "INFO")
            self.print_status("📚 API Docs: http://localhost:8000/docs", "INFO")
            self.print_status("Press Ctrl+C to stop all services", "INFO")
            
            # Keep the script running
            while True:
                time.sleep(1)
                
        except KeyboardInterrupt:
            self.print_status("Received interrupt signal", "WARNING")
        except Exception as e:
            self.print_status(f"Setup failed: {e}", "ERROR")
        finally:
            self.cleanup()
            self.print_status("Setup completed", "SUCCESS")

def main():
    """Main entry point"""
    setup = BrandRankerSetup()
    setup.run()

if __name__ == "__main__":
    main() 