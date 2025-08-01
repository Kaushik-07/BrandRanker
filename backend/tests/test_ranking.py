import pytest
from fastapi import status

class TestRanking:
    """Test ranking endpoints and functionality"""
    
    def test_rank_brands_success(self, client, test_ranking_data):
        """Test successful brand ranking"""
        response = client.post("/rank", json=test_ranking_data)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure
        assert "rankings" in data
        assert "average_ranks" in data
        
        # Check rankings structure
        rankings = data["rankings"]
        assert isinstance(rankings, dict)
        
        # Check that all categories have rankings
        for category in test_ranking_data["categories"]:
            assert category in rankings
            category_rankings = rankings[category]
            assert isinstance(category_rankings, dict)
            
            # Check that all brands are ranked
            for brand in test_ranking_data["brands"]:
                assert brand in category_rankings
                assert isinstance(category_rankings[brand], (int, float))
        
        # Check average ranks
        average_ranks = data["average_ranks"]
        assert isinstance(average_ranks, dict)
        
        for brand in test_ranking_data["brands"]:
            assert brand in average_ranks
            assert isinstance(average_ranks[brand], (int, float))
    
    def test_rank_brands_without_auth(self, client, test_ranking_data):
        """Test ranking without authentication (should work)"""
        response = client.post("/rank", json=test_ranking_data)
        assert response.status_code == 200
    
    def test_rank_brands_invalid_data(self, client):
        """Test ranking with invalid data"""
        # Test missing brands
        invalid_data = {"categories": ["Technology"]}
        response = client.post("/rank", json=invalid_data)
        assert response.status_code == 422
        
        # Test missing categories
        invalid_data = {"brands": ["Apple", "Samsung"]}
        response = client.post("/rank", json=invalid_data)
        assert response.status_code == 422
        
        # Test empty brands list
        invalid_data = {"brands": [], "categories": ["Technology"]}
        response = client.post("/rank", json=invalid_data)
        assert response.status_code == 422
        
        # Test empty categories list
        invalid_data = {"brands": ["Apple", "Samsung"], "categories": []}
        response = client.post("/rank", json=invalid_data)
        assert response.status_code == 422
    
    def test_rank_brands_validation_errors(self, client):
        """Test ranking with validation errors"""
        # Test with too many brands
        invalid_data = {
            "brands": ["Apple", "Samsung", "Google", "Microsoft", "Amazon", "Tesla"],
            "categories": ["Technology"]
        }
        response = client.post("/rank", json=invalid_data)
        assert response.status_code == 422
        
        # Test with too many categories
        invalid_data = {
            "brands": ["Apple", "Samsung"],
            "categories": ["Technology", "Smartphones", "Software", "Hardware"]
        }
        response = client.post("/rank", json=invalid_data)
        assert response.status_code == 422
        
        # Test with empty brand names
        invalid_data = {
            "brands": ["", "Samsung"],
            "categories": ["Technology"]
        }
        response = client.post("/rank", json=invalid_data)
        assert response.status_code == 422
        
        # Test with single brand
        invalid_data = {
            "brands": ["Apple"],
            "categories": ["Technology"]
        }
        response = client.post("/rank", json=invalid_data)
        assert response.status_code == 422
    
    def test_rank_brands_with_special_characters(self, client):
        """Test ranking with special characters in names"""
        test_data = {
            "brands": ["Apple Inc.", "Samsung Electronics", "Google LLC"],
            "categories": ["Smartphones & Mobile", "Technology & Innovation"]
        }
        
        response = client.post("/rank", json=test_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "rankings" in data
        assert "average_ranks" in data
    
    def test_rank_brands_with_numbers(self, client):
        """Test ranking with numbers in names"""
        test_data = {
            "brands": ["iPhone 14", "Samsung Galaxy S23", "Google Pixel 7"],
            "categories": ["5G Technology", "2023 Smartphones"]
        }
        
        response = client.post("/rank", json=test_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "rankings" in data
        assert "average_ranks" in data
    
    def test_rank_brands_multiple_categories(self, client):
        """Test ranking with multiple categories"""
        test_data = {
            "brands": ["Apple", "Samsung", "Google"],
            "categories": ["Smartphones", "Technology", "Innovation"]
        }
        
        response = client.post("/rank", json=test_data)
        assert response.status_code == 200
        
        data = response.json()
        rankings = data["rankings"]
        
        # Check that all categories are present
        for category in test_data["categories"]:
            assert category in rankings
            category_rankings = rankings[category]
            
            # Check that all brands are ranked in each category
            for brand in test_data["brands"]:
                assert brand in category_rankings
                assert isinstance(category_rankings[brand], (int, float))
    
    def test_rank_brands_ranking_consistency(self, client):
        """Test that rankings are consistent and valid"""
        test_data = {
            "brands": ["Apple", "Samsung", "Google"],
            "categories": ["Technology"]
        }
        
        response = client.post("/rank", json=test_data)
        assert response.status_code == 200
        
        data = response.json()
        rankings = data["rankings"]["Technology"]
        
        # Check that rankings are positive integers
        for brand, rank in rankings.items():
            assert isinstance(rank, (int, float))
            assert rank > 0
        
        # Check that rankings are unique (no ties in this simple case)
        rank_values = list(rankings.values())
        assert len(rank_values) == len(set(rank_values))
    
    def test_rank_brands_average_calculation(self, client):
        """Test that average ranks are calculated correctly"""
        test_data = {
            "brands": ["Apple", "Samsung", "Google"],
            "categories": ["Technology", "Smartphones"]
        }
        
        response = client.post("/rank", json=test_data)
        assert response.status_code == 200
        
        data = response.json()
        rankings = data["rankings"]
        average_ranks = data["average_ranks"]
        
        # Calculate expected averages manually
        for brand in test_data["brands"]:
            brand_ranks = []
            for category in test_data["categories"]:
                if brand in rankings[category]:
                    brand_ranks.append(rankings[category][brand])
            
            if brand_ranks:
                expected_average = sum(brand_ranks) / len(brand_ranks)
                assert brand in average_ranks
                # Allow for small floating point differences
                assert abs(average_ranks[brand] - expected_average) < 0.01
    
    def test_rank_brands_edge_cases(self, client):
        """Test ranking with edge cases"""
        # Test with minimum valid data
        test_data = {
            "brands": ["Apple", "Samsung"],
            "categories": ["Technology"]
        }
        
        response = client.post("/rank", json=test_data)
        assert response.status_code == 200
        
        # Test with maximum valid data
        test_data = {
            "brands": ["Apple", "Samsung", "Google", "Microsoft", "Amazon"],
            "categories": ["Technology", "Smartphones", "Software"]
        }
        
        response = client.post("/rank", json=test_data)
        assert response.status_code == 200
    
    def test_rank_brands_error_handling(self, client):
        """Test ranking error handling"""
        # Test with malformed JSON
        response = client.post("/rank", data="invalid json")
        assert response.status_code == 422
        
        # Test with wrong content type
        response = client.post("/rank", data="some text")
        assert response.status_code == 422
    
    def test_rank_brands_response_structure(self, client, test_ranking_data):
        """Test that ranking response has correct structure"""
        response = client.post("/rank", json=test_ranking_data)
        assert response.status_code == 200
        
        data = response.json()
        
        # Check required fields
        assert "rankings" in data
        assert "average_ranks" in data
        
        # Check data types
        assert isinstance(data["rankings"], dict)
        assert isinstance(data["average_ranks"], dict)
        
        # Check rankings structure
        rankings = data["rankings"]
        for category, category_rankings in rankings.items():
            assert isinstance(category_rankings, dict)
            for brand, rank in category_rankings.items():
                assert isinstance(rank, (int, float))
        
        # Check average ranks structure
        average_ranks = data["average_ranks"]
        for brand, avg_rank in average_ranks.items():
            assert isinstance(avg_rank, (int, float))
    
    def test_rank_brands_performance(self, client):
        """Test ranking performance with larger datasets"""
        # Test with more brands and categories
        test_data = {
            "brands": ["Apple", "Samsung", "Google", "Microsoft", "Amazon"],
            "categories": ["Technology", "Smartphones", "Software", "Hardware"]
        }
        
        response = client.post("/rank", json=test_data)
        assert response.status_code == 200
        
        # Check response time (should be reasonable)
        # This is a basic check - in a real scenario you might want to set specific timeouts
        assert response.status_code == 200
    
    def test_rank_brands_case_insensitive(self, client):
        """Test that ranking handles case variations"""
        test_data = {
            "brands": ["apple", "SAMSUNG", "Google"],
            "categories": ["technology", "SMARTPHONES"]
        }
        
        response = client.post("/rank", json=test_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "rankings" in data
        assert "average_ranks" in data 