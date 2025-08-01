import pytest
from fastapi import status

class TestHealth:
    """Test health check and basic endpoints"""
    
    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"
    
    def test_health_check_response_structure(self, client):
        """Test health check response structure"""
        response = client.get("/health")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, dict)
        assert "status" in data
        assert isinstance(data["status"], str)
    
    def test_health_check_headers(self, client):
        """Test health check response headers"""
        response = client.get("/health")
        assert response.status_code == 200
        
        headers = response.headers
        assert "content-type" in headers
        assert "application/json" in headers["content-type"]
    
    def test_health_check_methods(self, client):
        """Test health check with different HTTP methods"""
        # GET should work
        response = client.get("/health")
        assert response.status_code == 200
        
        # POST should not work (method not allowed)
        response = client.post("/health")
        assert response.status_code == 405
    
    def test_init_database(self, client):
        """Test database initialization endpoint"""
        response = client.post("/init-db")
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
        assert "Database initialized successfully" in data["message"]
    
    def test_init_database_methods(self, client):
        """Test database init with different HTTP methods"""
        # POST should work
        response = client.post("/init-db")
        assert response.status_code == 200
        
        # GET should not work (method not allowed)
        response = client.get("/init-db")
        assert response.status_code == 405
    
    def test_root_endpoint(self, client):
        """Test root endpoint (if exists)"""
        response = client.get("/")
        # Root endpoint might not exist, so we just check it doesn't crash
        assert response.status_code in [200, 404, 405]
    
    def test_nonexistent_endpoint(self, client):
        """Test non-existent endpoint"""
        response = client.get("/nonexistent")
        assert response.status_code == 404
    
    def test_health_check_performance(self, client):
        """Test health check performance"""
        import time
        
        start_time = time.time()
        response = client.get("/health")
        end_time = time.time()
        
        assert response.status_code == 200
        # Health check should be very fast (less than 1 second)
        assert end_time - start_time < 1.0
    
    def test_health_check_under_load(self, client):
        """Test health check under load"""
        import concurrent.futures
        import time
        
        def make_request():
            return client.get("/health")
        
        # Make multiple concurrent requests
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_request) for _ in range(10)]
            responses = [future.result() for future in concurrent.futures.as_completed(futures)]
        
        # All requests should succeed
        for response in responses:
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "healthy"
    
    def test_health_check_content_type(self, client):
        """Test health check content type"""
        response = client.get("/health")
        assert response.status_code == 200
        
        # Check content type
        assert "content-type" in response.headers
        content_type = response.headers["content-type"]
        assert "application/json" in content_type
    
    def test_health_check_cors_headers(self, client):
        """Test that health check includes CORS headers"""
        response = client.get("/health")
        assert response.status_code == 200
        
        headers = response.headers
        assert "access-control-allow-origin" in headers
        assert "access-control-allow-credentials" in headers
    
    def test_health_check_with_origin_header(self, client):
        """Test health check with origin header"""
        headers = {
            "Origin": "https://brand-ranker-app.web.app"
        }
        
        response = client.get("/health", headers=headers)
        assert response.status_code == 200
        
        # Check CORS headers
        cors_headers = response.headers
        assert "access-control-allow-origin" in cors_headers
    
    def test_health_check_error_handling(self, client):
        """Test health check error handling"""
        # Test with malformed request (should still work)
        response = client.get("/health", headers={"Invalid-Header": "value"})
        assert response.status_code == 200
        
        # Test with different content types
        response = client.get("/health", headers={"Accept": "text/plain"})
        assert response.status_code == 200
        # Should still return JSON
        data = response.json()
        assert "status" in data
    
    def test_health_check_cache_headers(self, client):
        """Test health check cache headers"""
        response = client.get("/health")
        assert response.status_code == 200
        
        headers = response.headers
        # Health check should not be cached
        if "cache-control" in headers:
            cache_control = headers["cache-control"]
            assert "no-cache" in cache_control or "no-store" in cache_control
    
    def test_health_check_response_time(self, client):
        """Test health check response time"""
        import time
        
        # Make multiple requests and measure average response time
        times = []
        for _ in range(5):
            start_time = time.time()
            response = client.get("/health")
            end_time = time.time()
            
            assert response.status_code == 200
            times.append(end_time - start_time)
        
        # Average response time should be very fast
        avg_time = sum(times) / len(times)
        assert avg_time < 0.1  # Less than 100ms average
    
    def test_health_check_concurrent_requests(self, client):
        """Test health check with concurrent requests"""
        import threading
        import time
        
        results = []
        errors = []
        
        def make_request():
            try:
                response = client.get("/health")
                results.append(response.status_code)
            except Exception as e:
                errors.append(str(e))
        
        # Start multiple threads
        threads = []
        for _ in range(5):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Check results
        assert len(errors) == 0, f"Errors occurred: {errors}"
        assert len(results) == 5
        for status_code in results:
            assert status_code == 200
    
    def test_health_check_database_connection(self, client):
        """Test that health check doesn't require database connection"""
        # This test assumes health check is lightweight
        response = client.get("/health")
        assert response.status_code == 200
        
        # Health check should be fast even if database is slow
        data = response.json()
        assert data["status"] == "healthy" 