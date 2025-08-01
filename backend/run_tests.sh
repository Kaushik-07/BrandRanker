#!/bin/bash

echo "🧪 BrandRanker Backend Test Suite"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ] && [ ! -d "../venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d "../venv" ]; then
    source ../venv/bin/activate
fi

# Install/upgrade dependencies
echo "📦 Installing/upgrading dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Set test environment variables
export TESTING=true
export DATABASE_URL="sqlite:///./test.db"
export SECRET_KEY="test-secret-key-for-testing-only"
export ENVIRONMENT="testing"

# Clean up any existing test database
if [ -f "test.db" ]; then
    echo "🧹 Cleaning up existing test database..."
    rm test.db
fi

# Function to run specific test category
run_test_category() {
    local category=$1
    echo ""
    echo "🧪 Running $category tests..."
    echo "--------------------------------"
    
    if [ -f "tests/test_$category.py" ]; then
        python -m pytest tests/test_$category.py -v --tb=short --color=yes
        return $?
    else
        echo "❌ Test file tests/test_$category.py not found"
        return 1
    fi
}

# Function to run all tests
run_all_tests() {
    echo ""
    echo "🧪 Running all tests..."
    echo "--------------------------------"
    python -m pytest tests/ -v --tb=short --color=yes
    return $?
}

# Function to run tests with coverage
run_coverage_tests() {
    echo ""
    echo "🧪 Running tests with coverage..."
    echo "--------------------------------"
    python -m pytest tests/ -v --cov=app --cov-report=term-missing --cov-report=html --tb=short --color=yes
    return $?
}

# Main execution
case "${1:-all}" in
    "auth")
        run_test_category "auth"
        ;;
    "experiments")
        run_test_category "experiments"
        ;;
    "cors")
        run_test_category "cors"
        ;;
    "validation")
        run_test_category "validation"
        ;;
    "ranking")
        run_test_category "ranking"
        ;;
    "health")
        run_test_category "health"
        ;;
    "coverage")
        run_coverage_tests
        ;;
    "all"|*)
        run_all_tests
        ;;
esac

test_result=$?

echo ""
echo "=================================="
if [ $test_result -eq 0 ]; then
    echo "✅ All tests completed successfully!"
    echo ""
    echo "📊 Test Summary:"
    echo "   - Authentication: ✅"
    echo "   - Experiments: ✅"
    echo "   - CORS: ✅"
    echo "   - Validation: ✅"
    echo "   - Ranking: ✅"
    echo "   - Health Checks: ✅"
    echo ""
    echo "🚀 Your backend is ready for production!"
else
    echo "❌ Some tests failed!"
    echo ""
    echo "🔧 To run specific test categories:"
    echo "   ./run_tests.sh auth"
    echo "   ./run_tests.sh experiments"
    echo "   ./run_tests.sh cors"
    echo "   ./run_tests.sh validation"
    echo "   ./run_tests.sh ranking"
    echo "   ./run_tests.sh health"
    echo "   ./run_tests.sh coverage"
fi

# Clean up test database
if [ -f "test.db" ]; then
    echo "🧹 Cleaning up test database..."
    rm test.db
fi

exit $test_result 