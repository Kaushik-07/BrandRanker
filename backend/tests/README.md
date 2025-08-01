# BrandRanker Backend Test Suite

This directory contains comprehensive unit tests for the BrandRanker backend API.

## 📁 Test Structure

```
tests/
├── __init__.py              # Python package marker
├── conftest.py              # Pytest configuration and fixtures
├── test_auth.py             # Authentication tests
├── test_experiments.py      # Experiment API tests
├── test_cors.py             # CORS functionality tests
├── test_validation.py       # Data validation tests
├── test_ranking.py          # Ranking functionality tests
├── test_health.py           # Health check tests
└── run_tests.py             # Test runner script
```

## 🧪 Test Categories

### 1. Authentication Tests (`test_auth.py`)
- ✅ User registration (success, duplicate email/username, invalid data)
- ✅ User login (success, invalid credentials, missing fields)
- ✅ Password hashing and verification
- ✅ JWT token creation and validation
- ✅ Protected endpoint access (with/without valid tokens)

### 2. Experiment Tests (`test_experiments.py`)
- ✅ Experiment creation (success, invalid data, validation)
- ✅ Experiment retrieval (by user, by ID, unauthorized access)
- ✅ Experiment data validation (limits, structure)
- ✅ Experiment results structure validation

### 3. CORS Tests (`test_cors.py`)
- ✅ CORS preflight requests
- ✅ CORS headers in responses
- ✅ Cross-origin request handling
- ✅ Credentials support
- ✅ Allowed methods and headers

### 4. Validation Tests (`test_validation.py`)
- ✅ Company validation (success, empty, invalid, mixed)
- ✅ Category validation (success, empty, invalid, mixed)
- ✅ Validation performance statistics
- ✅ Cache functionality
- ✅ Edge cases and special characters

### 5. Ranking Tests (`test_ranking.py`)
- ✅ Brand ranking functionality
- ✅ Multiple categories support
- ✅ Ranking consistency and validation
- ✅ Average rank calculations
- ✅ Error handling and edge cases

### 6. Health Tests (`test_health.py`)
- ✅ Health check endpoint
- ✅ Database initialization
- ✅ Performance under load
- ✅ CORS headers in health responses

## 🚀 Running Tests

### Run All Tests
```bash
cd backend
./run_tests.sh
```

### Run Specific Test Categories
```bash
# Authentication tests
./run_tests.sh auth

# Experiment tests
./run_tests.sh experiments

# CORS tests
./run_tests.sh cors

# Validation tests
./run_tests.sh validation

# Ranking tests
./run_tests.sh ranking

# Health tests
./run_tests.sh health

# Coverage tests
./run_tests.sh coverage
```

### Run Tests with Python
```bash
# Run all tests
python -m pytest tests/ -v

# Run specific test file
python -m pytest tests/test_auth.py -v

# Run with coverage
python -m pytest tests/ --cov=app --cov-report=html
```

## 📊 Test Results Summary

**Current Status: 77 passed, 13 failed**

### ✅ Working Features
- User authentication and registration
- Experiment creation and retrieval
- CORS preflight and cross-origin requests
- Brand ranking functionality
- Health check endpoints
- Data validation (partial)

### ⚠️ Areas Needing Attention
- Some validation endpoints returning 500 errors instead of 400
- CORS headers not consistently present in all responses
- Some data validation not working as expected
- AuthService missing `decode_token` method

## 🔧 Test Configuration

### Environment Variables
- `TESTING=true` - Enables test mode
- `DATABASE_URL=sqlite:///./test.db` - Test database
- `SECRET_KEY=test-secret-key-for-testing-only` - Test JWT secret
- `ENVIRONMENT=testing` - Test environment

### Pytest Configuration (`pytest.ini`)
- Verbose output with colors
- Short traceback format
- Strict markers for test categorization
- Warning filters for clean output

### Test Fixtures (`conftest.py`)
- Database session management
- Test client setup
- Authentication headers
- Test data fixtures

## 📈 Coverage Report

To generate a coverage report:
```bash
python -m pytest tests/ --cov=app --cov-report=term-missing --cov-report=html
```

This will create:
- Terminal coverage report
- HTML coverage report in `htmlcov/` directory

## 🐛 Debugging Failed Tests

### Common Issues
1. **Database Connection**: Ensure test database is properly initialized
2. **Authentication**: Check JWT token creation and validation
3. **CORS Headers**: Verify CORS middleware is working correctly
4. **Validation**: Ensure input validation is properly implemented

### Running Individual Tests
```bash
# Run specific test method
python -m pytest tests/test_auth.py::TestAuthentication::test_user_registration_success -v

# Run with detailed output
python -m pytest tests/test_auth.py -v -s
```

## 🚀 Continuous Integration

The test suite is designed to work with CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    cd backend
    ./run_tests.sh
```

## 📝 Adding New Tests

1. Create test file: `tests/test_feature.py`
2. Follow naming convention: `TestFeatureName`
3. Use existing fixtures from `conftest.py`
4. Add appropriate markers in `pytest.ini`
5. Update this README with new test category

## 🎯 Test Best Practices

- ✅ Use descriptive test names
- ✅ Test both success and failure cases
- ✅ Validate response structure and data types
- ✅ Test edge cases and error conditions
- ✅ Use fixtures for common setup
- ✅ Keep tests independent and isolated
- ✅ Clean up test data after each test

## 📞 Support

For test-related issues:
1. Check the test output for specific error messages
2. Verify environment variables are set correctly
3. Ensure all dependencies are installed
4. Check database connectivity and permissions 