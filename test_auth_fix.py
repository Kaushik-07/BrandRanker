#!/usr/bin/env python3
"""
Test script to verify authentication fix
"""
import requests
import json

# Test configuration
BASE_URL = "http://localhost:8000"  # Change this to your deployed URL for production testing

def test_auth_flow():
    """Test the complete authentication flow"""
    print("🧪 Testing authentication flow...")
    
    # Test 1: Register a new user
    print("\n1. Testing user registration...")
    register_data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpassword123"
    }
    
    try:
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json=register_data)
        print(f"✅ Registration status: {register_response.status_code}")
        if register_response.status_code == 200:
            print("✅ Registration successful")
        else:
            print(f"❌ Registration failed: {register_response.text}")
    except Exception as e:
        print(f"❌ Registration error: {e}")
    
    # Test 2: Login
    print("\n2. Testing user login...")
    login_data = {
        "username": "testuser",
        "password": "testpassword123"
    }
    
    try:
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        print(f"✅ Login status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            token_data = login_response.json()
            token = token_data.get("access_token")
            print("✅ Login successful, token received")
            print(f"🔍 Token: {token[:50]}..." if token else "❌ No token received")
            
            # Test 3: Access protected endpoint
            print("\n3. Testing protected endpoint access...")
            headers = {"Authorization": f"Bearer {token}"}
            
            experiments_response = requests.get(f"{BASE_URL}/api/experiments/", headers=headers)
            print(f"✅ Experiments endpoint status: {experiments_response.status_code}")
            
            if experiments_response.status_code == 200:
                print("✅ Successfully accessed protected endpoint")
                experiments = experiments_response.json()
                print(f"🔍 Found {len(experiments)} experiments")
            else:
                print(f"❌ Failed to access protected endpoint: {experiments_response.text}")
                
        else:
            print(f"❌ Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"❌ Login error: {e}")

def test_token_validation():
    """Test token validation specifically"""
    print("\n🧪 Testing token validation...")
    
    # First login to get a token
    login_data = {
        "username": "testuser",
        "password": "testpassword123"
    }
    
    try:
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        if login_response.status_code == 200:
            token = login_response.json().get("access_token")
            
            # Test with valid token
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{BASE_URL}/api/experiments/", headers=headers)
            print(f"✅ Valid token test: {response.status_code}")
            
            # Test with invalid token
            invalid_headers = {"Authorization": "Bearer invalid_token_here"}
            response = requests.get(f"{BASE_URL}/api/experiments/", headers=invalid_headers)
            print(f"✅ Invalid token test: {response.status_code} (should be 401)")
            
        else:
            print("❌ Could not get token for testing")
            
    except Exception as e:
        print(f"❌ Token validation test error: {e}")

if __name__ == "__main__":
    print("🚀 Starting authentication tests...")
    test_auth_flow()
    test_token_validation()
    print("\n✅ Authentication tests completed!") 