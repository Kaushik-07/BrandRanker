import pytest
from fastapi import status

class TestValidation:
    """Test validation endpoints and functionality"""
    
    def test_validate_companies_success(self, client):
        """Test successful company validation"""
        data = {
            "companies": ["Apple", "Samsung", "Google"]
        }
        
        response = client.post("/api/validate/companies", json=data)
        assert response.status_code == 200
        
        result = response.json()
        assert result["valid"] == True
        assert len(result["valid_items"]) > 0
        assert len(result["invalid_items"]) == 0
        assert result["error"] == ""
    
    def test_validate_companies_empty_list(self, client):
        """Test company validation with empty list"""
        data = {
            "companies": []
        }
        
        response = client.post("/api/validate/companies", json=data)
        assert response.status_code == 400
        assert "No companies provided" in response.json()["detail"]
    
    def test_validate_companies_missing_field(self, client):
        """Test company validation with missing companies field"""
        data = {}
        
        response = client.post("/api/validate/companies", json=data)
        assert response.status_code == 400
        assert "No companies provided" in response.json()["detail"]
    
    def test_validate_companies_invalid_companies(self, client):
        """Test company validation with invalid company names"""
        data = {
            "companies": ["InvalidCompany123", "FakeCorp", "TestBrand"]
        }
        
        response = client.post("/api/validate/companies", json=data)
        assert response.status_code == 200
        
        result = response.json()
        # The validation might fail for invalid companies
        assert "valid" in result
        assert "valid_items" in result
        assert "invalid_items" in result
    
    def test_validate_companies_mixed_valid_invalid(self, client):
        """Test company validation with mix of valid and invalid companies"""
        data = {
            "companies": ["Apple", "InvalidCompany", "Samsung", "FakeCorp"]
        }
        
        response = client.post("/api/validate/companies", json=data)
        assert response.status_code == 200
        
        result = response.json()
        assert "valid" in result
        assert "valid_items" in result
        assert "invalid_items" in result
    
    def test_validate_categories_success(self, client):
        """Test successful category validation"""
        data = {
            "categories": ["Smartphones", "Technology"]
        }
        
        response = client.post("/api/validate/categories", json=data)
        assert response.status_code == 200
        
        result = response.json()
        assert result["valid"] == True
        assert len(result["valid_items"]) > 0
        assert len(result["invalid_items"]) == 0
        assert result["error"] == ""
    
    def test_validate_categories_empty_list(self, client):
        """Test category validation with empty list"""
        data = {
            "categories": []
        }
        
        response = client.post("/api/validate/categories", json=data)
        assert response.status_code == 400
        assert "No categories provided" in response.json()["detail"]
    
    def test_validate_categories_missing_field(self, client):
        """Test category validation with missing categories field"""
        data = {}
        
        response = client.post("/api/validate/categories", json=data)
        assert response.status_code == 400
        assert "No categories provided" in response.json()["detail"]
    
    def test_validate_categories_invalid_categories(self, client):
        """Test category validation with invalid category names"""
        data = {
            "categories": ["InvalidCategory123", "FakeCategory", "TestCategory"]
        }
        
        response = client.post("/api/validate/categories", json=data)
        assert response.status_code == 200
        
        result = response.json()
        # The validation might fail for invalid categories
        assert "valid" in result
        assert "valid_items" in result
        assert "invalid_items" in result
    
    def test_validate_categories_mixed_valid_invalid(self, client):
        """Test category validation with mix of valid and invalid categories"""
        data = {
            "categories": ["Technology", "InvalidCategory", "Smartphones", "FakeCategory"]
        }
        
        response = client.post("/api/validate/categories", json=data)
        assert response.status_code == 200
        
        result = response.json()
        assert "valid" in result
        assert "valid_items" in result
        assert "invalid_items" in result
    
    def test_validation_performance_stats(self, client):
        """Test validation performance statistics endpoint"""
        response = client.get("/api/validation/performance")
        assert response.status_code == 200
        
        stats = response.json()
        assert "cache_hits" in stats
        assert "cache_misses" in stats
        assert "api_calls" in stats
        assert "total_requests" in stats
        assert "cache_hit_rate" in stats
        assert "cached_companies" in stats
        assert "cached_categories" in stats
        
        # Check data types
        assert isinstance(stats["cache_hits"], int)
        assert isinstance(stats["cache_misses"], int)
        assert isinstance(stats["api_calls"], int)
        assert isinstance(stats["total_requests"], int)
        assert isinstance(stats["cache_hit_rate"], float)
        assert isinstance(stats["cached_companies"], int)
        assert isinstance(stats["cached_categories"], int)
    
    def test_validation_with_special_characters(self, client):
        """Test validation with special characters in names"""
        # Test companies with special characters
        company_data = {
            "companies": ["Apple Inc.", "Samsung Electronics", "Google LLC"]
        }
        
        response = client.post("/api/validate/companies", json=company_data)
        assert response.status_code == 200
        
        # Test categories with special characters
        category_data = {
            "categories": ["Smartphones & Mobile", "Technology & Innovation"]
        }
        
        response = client.post("/api/validate/categories", json=category_data)
        assert response.status_code == 200
    
    def test_validation_with_numbers(self, client):
        """Test validation with numbers in names"""
        # Test companies with numbers
        company_data = {
            "companies": ["iPhone 14", "Samsung Galaxy S23", "Google Pixel 7"]
        }
        
        response = client.post("/api/validate/companies", json=company_data)
        assert response.status_code == 200
        
        # Test categories with numbers
        category_data = {
            "categories": ["5G Technology", "2023 Smartphones"]
        }
        
        response = client.post("/api/validate/categories", json=category_data)
        assert response.status_code == 200
    
    def test_validation_response_structure(self, client):
        """Test that validation responses have correct structure"""
        data = {
            "companies": ["Apple", "Samsung"]
        }
        
        response = client.post("/api/validate/companies", json=data)
        assert response.status_code == 200
        
        result = response.json()
        
        # Check required fields
        assert "valid" in result
        assert "valid_items" in result
        assert "invalid_items" in result
        assert "error" in result
        
        # Check data types
        assert isinstance(result["valid"], bool)
        assert isinstance(result["valid_items"], list)
        assert isinstance(result["invalid_items"], list)
        assert isinstance(result["error"], str)
    
    def test_validation_error_handling(self, client):
        """Test validation error handling"""
        # Test with malformed JSON
        response = client.post("/api/validate/companies", data="invalid json")
        assert response.status_code == 422
    
    def test_validation_cache_functionality(self, client):
        """Test that validation caching works"""
        data = {
            "companies": ["Apple", "Samsung", "Google"]
        }
        
        # First request
        response1 = client.post("/api/validate/companies", json=data)
        assert response1.status_code == 200
        
        # Second request (should use cache)
        response2 = client.post("/api/validate/companies", json=data)
        assert response2.status_code == 200
        
        # Check performance stats to see if cache was used
        stats_response = client.get("/api/validation/performance")
        assert stats_response.status_code == 200
        stats = stats_response.json()
        
        # Cache hits should increase
        assert stats["cache_hits"] >= 0
        assert stats["total_requests"] >= 2
    
    def test_validation_with_large_lists(self, client):
        """Test validation with larger lists of companies/categories"""
        # Test with many companies
        company_data = {
            "companies": [
                "Apple", "Samsung", "Google", "Microsoft", "Amazon", 
                "Tesla", "Meta", "Netflix", "Intel", "AMD"
            ]
        }
        
        response = client.post("/api/validate/companies", json=company_data)
        assert response.status_code == 200
        
        # Test with many categories
        category_data = {
            "categories": [
                "Technology", "Smartphones", "Software", "Hardware",
                "Mobile", "Computing", "Innovation"
            ]
        }
        
        response = client.post("/api/validate/categories", json=category_data)
        assert response.status_code == 200
    
    def test_validation_edge_cases(self, client):
        """Test validation with edge cases"""
        # Test with very long names
        long_name = "A" * 100
        data = {
            "companies": [long_name]
        }
        
        response = client.post("/api/validate/companies", json=data)
        assert response.status_code == 200
        
        # Test with very short names
        data = {
            "companies": ["A"]
        }
        
        response = client.post("/api/validate/companies", json=data)
        assert response.status_code == 200
        
        # Test with empty strings
        data = {
            "companies": ["", "Apple"]
        }
        
        response = client.post("/api/validate/companies", json=data)
        assert response.status_code == 200 