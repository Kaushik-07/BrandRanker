#!/usr/bin/env python3
"""
Test Runner for BrandRanker Backend
Runs all tests with proper configuration and reporting
"""

import os
import sys
import subprocess
import pytest
from pathlib import Path

def setup_test_environment():
    """Setup test environment variables"""
    os.environ["TESTING"] = "true"
    os.environ["DATABASE_URL"] = "sqlite:///./test.db"
    os.environ["SECRET_KEY"] = "test-secret-key-for-testing-only"
    os.environ["ENVIRONMENT"] = "testing"

def run_tests():
    """Run all tests with proper configuration"""
    print("🧪 Starting BrandRanker Backend Tests")
    print("=" * 50)
    
    # Setup test environment
    setup_test_environment()
    
    # Get the tests directory
    tests_dir = Path(__file__).parent
    
    # Run tests with pytest
    try:
        # Run tests with verbose output and coverage
        result = pytest.main([
            str(tests_dir),
            "-v",
            "--tb=short",
            "--strict-markers",
            "--disable-warnings",
            "--color=yes"
        ])
        
        if result == 0:
            print("\n✅ All tests passed!")
            return True
        else:
            print(f"\n❌ Tests failed with exit code: {result}")
            return False
            
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        return False

def run_specific_test_category(category):
    """Run tests for a specific category"""
    print(f"🧪 Running {category} tests")
    print("=" * 50)
    
    setup_test_environment()
    
    tests_dir = Path(__file__).parent
    test_file = tests_dir / f"test_{category}.py"
    
    if not test_file.exists():
        print(f"❌ Test file not found: {test_file}")
        return False
    
    try:
        result = pytest.main([
            str(test_file),
            "-v",
            "--tb=short",
            "--strict-markers",
            "--disable-warnings",
            "--color=yes"
        ])
        
        if result == 0:
            print(f"\n✅ {category} tests passed!")
            return True
        else:
            print(f"\n❌ {category} tests failed!")
            return False
            
    except Exception as e:
        print(f"❌ Error running {category} tests: {e}")
        return False

def run_coverage_tests():
    """Run tests with coverage reporting"""
    print("🧪 Running tests with coverage")
    print("=" * 50)
    
    setup_test_environment()
    
    tests_dir = Path(__file__).parent
    
    try:
        # Run tests with coverage
        result = pytest.main([
            str(tests_dir),
            "-v",
            "--cov=app",
            "--cov-report=term-missing",
            "--cov-report=html",
            "--tb=short",
            "--strict-markers",
            "--disable-warnings",
            "--color=yes"
        ])
        
        if result == 0:
            print("\n✅ Coverage tests completed!")
            return True
        else:
            print(f"\n❌ Coverage tests failed!")
            return False
            
    except Exception as e:
        print(f"❌ Error running coverage tests: {e}")
        return False

def main():
    """Main function to run tests"""
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "auth":
            return run_specific_test_category("auth")
        elif command == "experiments":
            return run_specific_test_category("experiments")
        elif command == "cors":
            return run_specific_test_category("cors")
        elif command == "validation":
            return run_specific_test_category("validation")
        elif command == "ranking":
            return run_specific_test_category("ranking")
        elif command == "health":
            return run_specific_test_category("health")
        elif command == "coverage":
            return run_coverage_tests()
        else:
            print(f"❌ Unknown test category: {command}")
            print("Available categories: auth, experiments, cors, validation, ranking, health, coverage")
            return False
    else:
        return run_tests()

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 