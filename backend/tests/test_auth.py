import pytest
from fastapi import status
from app.services.auth_service import AuthService

class TestAuthentication:
    """Test authentication endpoints and functionality"""
    
    def test_user_registration_success(self, client, test_user_data):
        """Test successful user registration"""
        response = client.post("/api/auth/register", json=test_user_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user_data["email"]
        assert data["username"] == test_user_data["username"]
        assert "id" in data
        assert "hashed_password" not in data  # Password should not be returned
    
    def test_user_registration_duplicate_email(self, client, test_user_data):
        """Test registration with duplicate email"""
        # Register first user
        response1 = client.post("/api/auth/register", json=test_user_data)
        assert response1.status_code == 200
        
        # Try to register with same email
        duplicate_data = test_user_data.copy()
        duplicate_data["username"] = "differentuser"
        response2 = client.post("/api/auth/register", json=duplicate_data)
        
        assert response2.status_code == 400
        assert "Email already registered" in response2.json()["detail"]
    
    def test_user_registration_duplicate_username(self, client, test_user_data):
        """Test registration with duplicate username"""
        # Register first user
        response1 = client.post("/api/auth/register", json=test_user_data)
        assert response1.status_code == 200
        
        # Try to register with same username
        duplicate_data = test_user_data.copy()
        duplicate_data["email"] = "different@example.com"
        response2 = client.post("/api/auth/register", json=duplicate_data)
        
        assert response2.status_code == 400
        assert "Username already taken" in response2.json()["detail"]
    
    def test_user_registration_invalid_data(self, client):
        """Test registration with invalid data"""
        # Test missing fields
        response = client.post("/api/auth/register", json={})
        assert response.status_code == 422
        
        # Test invalid email
        invalid_data = {
            "email": "invalid-email",
            "username": "testuser",
            "password": "password123"
        }
        response = client.post("/api/auth/register", json=invalid_data)
        assert response.status_code == 422
    
    def test_user_login_success(self, client, test_user_data):
        """Test successful user login"""
        # Register user first
        register_response = client.post("/api/auth/register", json=test_user_data)
        assert register_response.status_code == 200
        
        # Login
        login_data = {
            "username": test_user_data["username"],
            "password": test_user_data["password"]
        }
        login_response = client.post("/api/auth/login", json=login_data)
        
        assert login_response.status_code == 200
        data = login_response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 0
    
    def test_user_login_invalid_username(self, client, test_user_data):
        """Test login with invalid username"""
        # Register user first
        register_response = client.post("/api/auth/register", json=test_user_data)
        assert register_response.status_code == 200
        
        # Try to login with wrong username
        login_data = {
            "username": "wronguser",
            "password": test_user_data["password"]
        }
        login_response = client.post("/api/auth/login", json=login_data)
        
        assert login_response.status_code == 401
        assert "Username not found" in login_response.json()["detail"]
    
    def test_user_login_invalid_password(self, client, test_user_data):
        """Test login with invalid password"""
        # Register user first
        register_response = client.post("/api/auth/register", json=test_user_data)
        assert register_response.status_code == 200
        
        # Try to login with wrong password
        login_data = {
            "username": test_user_data["username"],
            "password": "wrongpassword"
        }
        login_response = client.post("/api/auth/login", json=login_data)
        
        assert login_response.status_code == 401
        assert "Incorrect password" in login_response.json()["detail"]
    
    def test_user_login_missing_fields(self, client):
        """Test login with missing fields"""
        response = client.post("/api/auth/login", json={})
        assert response.status_code == 422
    
    def test_auth_service_password_hashing(self):
        """Test password hashing functionality"""
        auth_service = AuthService()
        password = "testpassword123"
        
        # Hash password
        hashed = auth_service.get_password_hash(password)
        assert hashed != password
        assert len(hashed) > len(password)
        
        # Verify password
        assert auth_service.verify_password(password, hashed) == True
        assert auth_service.verify_password("wrongpassword", hashed) == False
    
    def test_auth_service_token_creation(self):
        """Test JWT token creation and validation"""
        auth_service = AuthService()
        username = "testuser"
        
        # Create token
        token = auth_service.create_access_token(data={"sub": username})
        assert len(token) > 0
        
        # Verify token can be decoded
        payload = auth_service.decode_token(token)
        assert payload["sub"] == username
    
    def test_protected_endpoint_with_valid_token(self, client, auth_headers):
        """Test accessing protected endpoint with valid token"""
        response = client.get("/test-auth", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "Authentication working for user: testuser" in data["message"]
    
    def test_protected_endpoint_without_token(self, client):
        """Test accessing protected endpoint without token"""
        response = client.get("/test-auth")
        assert response.status_code == 401
        assert "Invalid authentication credentials" in response.json()["detail"]
    
    def test_protected_endpoint_with_invalid_token(self, client):
        """Test accessing protected endpoint with invalid token"""
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/test-auth", headers=headers)
        assert response.status_code == 401
        assert "Invalid token" in response.json()["detail"]
    
    def test_protected_endpoint_with_malformed_token(self, client):
        """Test accessing protected endpoint with malformed token"""
        headers = {"Authorization": "Bearer"}
        response = client.get("/test-auth", headers=headers)
        assert response.status_code == 401
        assert "Invalid authentication credentials" in response.json()["detail"] 