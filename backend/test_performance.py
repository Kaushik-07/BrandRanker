#!/usr/bin/env python3
"""
Quick performance test for validation service
"""
import asyncio
import time
from app.services.validation_service import ValidationService

async def test_performance():
    """Test validation performance improvements"""
    service = ValidationService()
    
    # Test data
    companies = ["Nike", "Adidas", "Apple", "Samsung"]
    categories = ["Sneakers", "Smartphones"]
    
    print("🚀 Testing validation performance...")
    print("=" * 50)
    
    # First run - should be slower (API calls)
    print("\n📊 First validation (uncached):")
    start_time = time.time()
    is_valid, valid_companies, error = await service.validate_companies(companies)
    first_time = time.time() - start_time
    print(f"   Companies validation: {first_time:.3f}s")
    print(f"   Valid companies: {valid_companies}")
    
    # Second run - should be much faster (cached)
    print("\n📊 Second validation (cached):")
    start_time = time.time()
    is_valid, valid_companies, error = await service.validate_companies(companies)
    second_time = time.time() - start_time
    print(f"   Companies validation: {second_time:.3f}s")
    print(f"   Valid companies: {valid_companies}")
    
    # Performance stats
    stats = service.get_performance_stats()
    print("\n📈 Performance Statistics:")
    print(f"   Cache hits: {stats['cache_hits']}")
    print(f"   Cache misses: {stats['cache_misses']}")
    print(f"   API calls: {stats['api_calls']}")
    print(f"   Cache hit rate: {stats['cache_hit_rate']}%")
    print(f"   Cached companies: {stats['cached_companies']}")
    
    # Performance improvement
    if first_time > 0:
        improvement = ((first_time - second_time) / first_time) * 100
        print(f"\n🎯 Performance Improvement: {improvement:.1f}%")
    
    print("\n✅ Test completed!")

if __name__ == "__main__":
    asyncio.run(test_performance()) 