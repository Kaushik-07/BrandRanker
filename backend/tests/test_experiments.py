import pytest
from fastapi import status

class TestExperiments:
    """Test experiment endpoints and functionality"""
    
    def test_create_experiment_success(self, client, auth_headers, test_experiment_data):
        """Test successful experiment creation"""
        response = client.post("/api/experiments/", json=test_experiment_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "experiment" in data
        assert "message" in data
        assert data["message"] == "Experiment created successfully"
        
        experiment = data["experiment"]
        assert experiment["id"] is not None
        assert experiment["companies"] == test_experiment_data["companies"]
        assert experiment["categories"] == test_experiment_data["categories"]
        assert "results" in experiment
        assert "average_ranks" in experiment
        assert "created_at" in experiment
    
    def test_create_experiment_without_auth(self, client, test_experiment_data):
        """Test experiment creation without authentication"""
        response = client.post("/api/experiments/", json=test_experiment_data)
        assert response.status_code == 401
    
    def test_create_experiment_invalid_data(self, client, auth_headers):
        """Test experiment creation with invalid data"""
        # Test missing companies
        invalid_data = {"categories": ["Technology"]}
        response = client.post("/api/experiments/", json=invalid_data, headers=auth_headers)
        assert response.status_code == 422
        
        # Test missing categories
        invalid_data = {"companies": ["Apple", "Samsung"]}
        response = client.post("/api/experiments/", json=invalid_data, headers=auth_headers)
        assert response.status_code == 422
        
        # Test empty companies list
        invalid_data = {"companies": [], "categories": ["Technology"]}
        response = client.post("/api/experiments/", json=invalid_data, headers=auth_headers)
        assert response.status_code == 422
        
        # Test empty categories list
        invalid_data = {"companies": ["Apple", "Samsung"], "categories": []}
        response = client.post("/api/experiments/", json=invalid_data, headers=auth_headers)
        assert response.status_code == 422
    
    def test_get_experiments_success(self, client, auth_headers, test_experiment_data):
        """Test successful experiment retrieval"""
        # Create an experiment first
        create_response = client.post("/api/experiments/", json=test_experiment_data, headers=auth_headers)
        assert create_response.status_code == 200
        
        # Get experiments
        response = client.get("/api/experiments/", headers=auth_headers)
        assert response.status_code == 200
        
        experiments = response.json()
        assert isinstance(experiments, list)
        assert len(experiments) >= 1
        
        # Check experiment structure
        experiment = experiments[0]
        assert "id" in experiment
        assert "companies" in experiment
        assert "categories" in experiment
        assert "results" in experiment
        assert "average_ranks" in experiment
        assert "created_at" in experiment
    
    def test_get_experiments_without_auth(self, client):
        """Test experiment retrieval without authentication"""
        response = client.get("/api/experiments/")
        assert response.status_code == 401
    
    def test_get_experiments_empty_list(self, client, auth_headers):
        """Test getting experiments when user has none"""
        response = client.get("/api/experiments/", headers=auth_headers)
        assert response.status_code == 200
        experiments = response.json()
        assert isinstance(experiments, list)
        # Note: This might not be empty if previous tests created experiments
    
    def test_get_experiment_by_id_success(self, client, auth_headers, test_experiment_data):
        """Test successful experiment retrieval by ID"""
        # Create an experiment first
        create_response = client.post("/api/experiments/", json=test_experiment_data, headers=auth_headers)
        assert create_response.status_code == 200
        experiment_id = create_response.json()["experiment"]["id"]
        
        # Get specific experiment
        response = client.get(f"/api/experiments/{experiment_id}", headers=auth_headers)
        assert response.status_code == 200
        
        experiment = response.json()
        assert experiment["id"] == experiment_id
        assert experiment["companies"] == test_experiment_data["companies"]
        assert experiment["categories"] == test_experiment_data["categories"]
    
    def test_get_experiment_by_id_not_found(self, client, auth_headers):
        """Test getting non-existent experiment"""
        response = client.get("/api/experiments/99999", headers=auth_headers)
        assert response.status_code == 404
        assert "Experiment not found" in response.json()["detail"]
    
    def test_get_experiment_by_id_without_auth(self, client):
        """Test getting experiment without authentication"""
        response = client.get("/api/experiments/1")
        assert response.status_code == 401
    
    def test_get_experiment_by_id_unauthorized(self, client, auth_headers, test_experiment_data):
        """Test getting experiment that doesn't belong to user"""
        # Create experiment with one user
        create_response = client.post("/api/experiments/", json=test_experiment_data, headers=auth_headers)
        assert create_response.status_code == 200
        experiment_id = create_response.json()["experiment"]["id"]
        
        # Create another user and try to access the experiment
        other_user_data = {
            "email": "other@example.com",
            "username": "otheruser",
            "password": "password123"
        }
        
        # Register other user
        register_response = client.post("/api/auth/register", json=other_user_data)
        assert register_response.status_code == 200
        
        # Login as other user
        login_response = client.post("/api/auth/login", json={
            "username": other_user_data["username"],
            "password": other_user_data["password"]
        })
        assert login_response.status_code == 200
        
        other_token = login_response.json()["access_token"]
        other_headers = {"Authorization": f"Bearer {other_token}"}
        
        # Try to access experiment with other user
        response = client.get(f"/api/experiments/{experiment_id}", headers=other_headers)
        assert response.status_code == 403
        assert "Access denied" in response.json()["detail"]
    
    def test_experiment_data_validation(self, client, auth_headers):
        """Test experiment data validation"""
        # Test with too many companies
        invalid_data = {
            "companies": ["Apple", "Samsung", "Google", "Microsoft", "Amazon", "Tesla"],
            "categories": ["Technology"]
        }
        response = client.post("/api/experiments/", json=invalid_data, headers=auth_headers)
        assert response.status_code == 422
        
        # Test with too many categories
        invalid_data = {
            "companies": ["Apple", "Samsung"],
            "categories": ["Technology", "Smartphones", "Software", "Hardware"]
        }
        response = client.post("/api/experiments/", json=invalid_data, headers=auth_headers)
        assert response.status_code == 422
        
        # Test with empty company names
        invalid_data = {
            "companies": ["", "Samsung"],
            "categories": ["Technology"]
        }
        response = client.post("/api/experiments/", json=invalid_data, headers=auth_headers)
        assert response.status_code == 422
        
        # Test with single company
        invalid_data = {
            "companies": ["Apple"],
            "categories": ["Technology"]
        }
        response = client.post("/api/experiments/", json=invalid_data, headers=auth_headers)
        assert response.status_code == 422
    
    def test_experiment_results_structure(self, client, auth_headers, test_experiment_data):
        """Test that experiment results have correct structure"""
        response = client.post("/api/experiments/", json=test_experiment_data, headers=auth_headers)
        assert response.status_code == 200
        
        experiment = response.json()["experiment"]
        
        # Check results structure
        assert "results" in experiment
        results = experiment["results"]
        
        # Each category should have rankings and reason
        for category in test_experiment_data["categories"]:
            assert category in results
            category_data = results[category]
            assert "rankings" in category_data
            assert "reason" in category_data
            
            # Rankings should contain all companies
            rankings = category_data["rankings"]
            for company in test_experiment_data["companies"]:
                assert company in rankings
                assert isinstance(rankings[company], (int, float))
        
        # Check average ranks
        assert "average_ranks" in experiment
        average_ranks = experiment["average_ranks"]
        for company in test_experiment_data["companies"]:
            assert company in average_ranks
            assert isinstance(average_ranks[company], (int, float))
    
    def test_experiment_creation_with_special_characters(self, client, auth_headers):
        """Test experiment creation with special characters in names"""
        test_data = {
            "companies": ["Apple Inc.", "Samsung Electronics", "Google LLC"],
            "categories": ["Smartphones & Mobile", "Technology & Innovation"]
        }
        
        response = client.post("/api/experiments/", json=test_data, headers=auth_headers)
        assert response.status_code == 200
        
        experiment = response.json()["experiment"]
        assert experiment["companies"] == test_data["companies"]
        assert experiment["categories"] == test_data["categories"] 