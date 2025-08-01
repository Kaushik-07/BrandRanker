#!/usr/bin/env python3
"""
Simple Global Access Test for BrandRanker
"""

import requests
import json

def test_global_access():
    """Test global access to BrandRanker backend"""
    
    # Test URLs
    urls = [
        "http://localhost:8000",
        "https://brand-ranker-backend.onrender.com"
    ]
    
    for url in urls:
        print(f"\n🌐 Testing: {url}")
        print("=" * 50)
        
        try:
            # Test 1: Health endpoint
            print("🏥 Testing health endpoint...")
            response = requests.get(f"{url}/health")
            print(f"✅ Status: {response.status_code}")
            print(f"📄 Response: {response.json()}")
            
            # Test 2: CORS headers
            print("\n🌐 Testing CORS headers...")
            headers = {"Origin": "https://brand-ranker-app.web.app"}
            response = requests.get(f"{url}/health", headers=headers)
            cors_headers = {k: v for k, v in response.headers.items() if 'access-control' in k.lower()}
            print(f"✅ CORS Headers: {cors_headers}")
            
            # Test 3: Validation endpoints
            print("\n🔍 Testing validation endpoints...")
            
            # Company validation
            company_data = {"companies": ["Apple", "Samsung"]}
            response = requests.post(f"{url}/api/validate/companies", json=company_data)
            print(f"✅ Company validation: {response.status_code}")
            print(f"📄 Response: {response.json()}")
            
            # Category validation
            category_data = {"categories": ["Smartphones", "Technology"]}
            response = requests.post(f"{url}/api/validate/categories", json=category_data)
            print(f"✅ Category validation: {response.status_code}")
            print(f"📄 Response: {response.json()}")
            
            # Test 4: Authentication endpoints
            print("\n🔐 Testing authentication endpoints...")
            auth_data = {"username": "test", "password": "test"}
            response = requests.post(f"{url}/api/auth/login", json=auth_data)
            print(f"✅ Login endpoint: {response.status_code}")
            
        except Exception as e:
            print(f"❌ Error testing {url}: {e}")
    
    print("\n" + "=" * 50)
    print("✅ Global access test completed!")

if __name__ == "__main__":
    test_global_access() 