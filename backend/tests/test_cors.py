import pytest
from fastapi import status

class TestCORS:
    """Test CORS functionality and cross-origin requests"""
    
    def test_cors_preflight_options(self, client):
        """Test CORS preflight OPTIONS request"""
        headers = {
            "Origin": "https://brand-ranker-app.web.app",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type,Authorization"
        }
        
        response = client.options("/api/auth/login", headers=headers)
        assert response.status_code == 200
        
        # Check CORS headers
        cors_headers = response.headers
        assert "access-control-allow-origin" in cors_headers
        assert "access-control-allow-methods" in cors_headers
        assert "access-control-allow-headers" in cors_headers
        assert "access-control-allow-credentials" in cors_headers
    
    def test_cors_preflight_all_endpoints(self, client):
        """Test CORS preflight for various endpoints"""
        endpoints = [
            "/api/auth/register",
            "/api/auth/login",
            "/api/experiments/",
            "/health",
            "/rank"
        ]
        
        headers = {
            "Origin": "https://brand-ranker-app.web.app",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type,Authorization"
        }
        
        for endpoint in endpoints:
            response = client.options(endpoint, headers=headers)
            assert response.status_code == 200
            
            # Check that CORS headers are present
            cors_headers = response.headers
            assert "access-control-allow-origin" in cors_headers
    
    def test_cors_headers_in_response(self, client):
        """Test that CORS headers are included in actual responses"""
        # Test with a simple GET request
        response = client.get("/health")
        assert response.status_code == 200
        
        # Check CORS headers
        cors_headers = response.headers
        assert "access-control-allow-origin" in cors_headers
        assert "access-control-allow-credentials" in cors_headers
    
    def test_cors_with_different_origins(self, client):
        """Test CORS with different allowed origins"""
        allowed_origins = [
            "http://localhost:3000",
            "https://brand-ranker-app.web.app",
            "https://brand-ranker-app.firebaseapp.com"
        ]
        
        for origin in allowed_origins:
            headers = {
                "Origin": origin,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type,Authorization"
            }
            
            response = client.options("/api/auth/login", headers=headers)
            assert response.status_code == 200
            
            # Check that the origin is allowed
            cors_headers = response.headers
            assert "access-control-allow-origin" in cors_headers
    
    def test_cors_credentials_support(self, client):
        """Test that CORS supports credentials"""
        headers = {
            "Origin": "https://brand-ranker-app.web.app",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type,Authorization"
        }
        
        response = client.options("/api/auth/login", headers=headers)
        assert response.status_code == 200
        
        cors_headers = response.headers
        assert "access-control-allow-credentials" in cors_headers
        assert cors_headers["access-control-allow-credentials"] == "true"
    
    def test_cors_allowed_methods(self, client):
        """Test that all required HTTP methods are allowed"""
        headers = {
            "Origin": "https://brand-ranker-app.web.app",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Content-Type,Authorization"
        }
        
        response = client.options("/api/experiments/", headers=headers)
        assert response.status_code == 200
        
        cors_headers = response.headers
        allowed_methods = cors_headers["access-control-allow-methods"]
        
        # Check that all required methods are allowed
        required_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        for method in required_methods:
            assert method in allowed_methods
    
    def test_cors_allowed_headers(self, client):
        """Test that all required headers are allowed"""
        headers = {
            "Origin": "https://brand-ranker-app.web.app",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type,Authorization,X-Requested-With"
        }
        
        response = client.options("/api/auth/login", headers=headers)
        assert response.status_code == 200
        
        cors_headers = response.headers
        allowed_headers = cors_headers["access-control-allow-headers"]
        
        # Check that important headers are allowed
        important_headers = ["Content-Type", "Authorization", "X-Requested-With"]
        for header in important_headers:
            assert header in allowed_headers
    
    def test_cors_max_age_header(self, client):
        """Test that CORS max-age header is set"""
        headers = {
            "Origin": "https://brand-ranker-app.web.app",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type,Authorization"
        }
        
        response = client.options("/api/auth/login", headers=headers)
        assert response.status_code == 200
        
        cors_headers = response.headers
        assert "access-control-max-age" in cors_headers
        assert cors_headers["access-control-max-age"] == "86400"
    
    def test_cors_with_actual_request(self, client, test_user_data):
        """Test CORS with actual POST request"""
        headers = {
            "Origin": "https://brand-ranker-app.web.app",
            "Content-Type": "application/json"
        }
        
        response = client.post("/api/auth/register", json=test_user_data, headers=headers)
        assert response.status_code == 200
        
        # Check CORS headers in response
        cors_headers = response.headers
        assert "access-control-allow-origin" in cors_headers
        assert "access-control-allow-credentials" in cors_headers
    
    def test_cors_error_handling(self, client):
        """Test CORS headers are present even in error responses"""
        headers = {
            "Origin": "https://brand-ranker-app.web.app",
            "Content-Type": "application/json"
        }
        
        # Make a request that will cause an error
        response = client.post("/api/auth/login", json={}, headers=headers)
        assert response.status_code == 422  # Validation error
        
        # Check that CORS headers are still present
        cors_headers = response.headers
        assert "access-control-allow-origin" in cors_headers
        assert "access-control-allow-credentials" in cors_headers
    
    def test_cors_with_authentication(self, client, auth_headers):
        """Test CORS with authenticated requests"""
        headers = {
            **auth_headers,
            "Origin": "https://brand-ranker-app.web.app"
        }
        
        response = client.get("/api/experiments/", headers=headers)
        assert response.status_code == 200
        
        # Check CORS headers
        cors_headers = response.headers
        assert "access-control-allow-origin" in cors_headers
        assert "access-control-allow-credentials" in cors_headers
    
    def test_cors_origin_wildcard(self, client):
        """Test that wildcard origin is handled correctly"""
        headers = {
            "Origin": "https://any-other-domain.com",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type,Authorization"
        }
        
        response = client.options("/api/auth/login", headers=headers)
        assert response.status_code == 200
        
        # Check that wildcard origin is allowed
        cors_headers = response.headers
        assert "access-control-allow-origin" in cors_headers
    
    def test_cors_exposed_headers(self, client):
        """Test that important headers are exposed"""
        headers = {
            "Origin": "https://brand-ranker-app.web.app",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Content-Type,Authorization"
        }
        
        response = client.options("/api/experiments/", headers=headers)
        assert response.status_code == 200
        
        cors_headers = response.headers
        if "access-control-expose-headers" in cors_headers:
            exposed_headers = cors_headers["access-control-expose-headers"]
            # Check that important headers are exposed
            important_headers = ["Content-Type", "Authorization"]
            for header in important_headers:
                assert header in exposed_headers 