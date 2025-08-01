#!/usr/bin/env python3
"""
Test script to verify CORS configuration for production
"""
import requests
import json

def test_cors_configuration():
    """Test CORS configuration for production endpoints"""
    
    # Production backend URL
    base_url = "https://brand-ranker-backend.onrender.com"
    
    # Test origins
    test_origins = [
        "https://brand-ranker-app.web.app",
        "https://brand-ranker-app.firebaseapp.com",
        "https://brandranker.vercel.app",
        "https://brandranker.netlify.app",
        "http://localhost:3000"  # For local testing
    ]
    
    # Test endpoints
    endpoints = [
        "/api/auth/register",
        "/api/auth/login",
        "/api/experiments/",
        "/health"
    ]
    
    print("🔍 Testing CORS Configuration for Production")
    print("=" * 50)
    
    for origin in test_origins:
        print(f"\n🌐 Testing Origin: {origin}")
        
        for endpoint in endpoints:
            url = f"{base_url}{endpoint}"
            
            # Test OPTIONS (preflight) request
            try:
                headers = {
                    "Origin": origin,
                    "Access-Control-Request-Method": "POST",
                    "Access-Control-Request-Headers": "Content-Type,Authorization"
                }
                
                response = requests.options(url, headers=headers, timeout=10)
                
                print(f"  ✅ {endpoint}: OPTIONS - Status: {response.status_code}")
                
                # Check CORS headers
                cors_headers = response.headers
                if "access-control-allow-origin" in cors_headers:
                    print(f"     CORS Origin: {cors_headers['access-control-allow-origin']}")
                if "access-control-allow-credentials" in cors_headers:
                    print(f"     CORS Credentials: {cors_headers['access-control-allow-credentials']}")
                
            except requests.exceptions.RequestException as e:
                print(f"  ❌ {endpoint}: OPTIONS - Error: {e}")
            
            # Test actual POST request (for auth endpoints)
            if "auth" in endpoint:
                try:
                    headers = {
                        "Origin": origin,
                        "Content-Type": "application/json"
                    }
                    
                    # Test data
                    test_data = {
                        "email": "test@example.com",
                        "username": "testuser",
                        "password": "testpass123"
                    }
                    
                    response = requests.post(url, headers=headers, json=test_data, timeout=10)
                    
                    print(f"  ✅ {endpoint}: POST - Status: {response.status_code}")
                    
                    # Check CORS headers in response
                    cors_headers = response.headers
                    if "access-control-allow-origin" in cors_headers:
                        print(f"     CORS Origin: {cors_headers['access-control-allow-origin']}")
                    if "access-control-allow-credentials" in cors_headers:
                        print(f"     CORS Credentials: {cors_headers['access-control-allow-credentials']}")
                
                except requests.exceptions.RequestException as e:
                    print(f"  ❌ {endpoint}: POST - Error: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 CORS Test Complete!")
    print("\n📋 Summary:")
    print("- If you see ✅ for all endpoints, CORS is working correctly")
    print("- If you see ❌ for any endpoint, there's a CORS issue")
    print("- Check that 'access-control-allow-origin' matches your frontend URL")
    print("- Check that 'access-control-allow-credentials' is 'true'")

if __name__ == "__main__":
    test_cors_configuration() 