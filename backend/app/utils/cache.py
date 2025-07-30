import redis
import os
import json
from typing import Optional, Dict

# Try Redis first, fallback to in-memory
try:
    redis_client = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))
    redis_client.ping()  # Test connection
    REDIS_AVAILABLE = True
except:
    REDIS_AVAILABLE = False
    _memory_cache = {}

def cache_response(key: str, data: Dict, ttl: int = 3600):
    """Cache response in Redis or memory"""
    try:
        if REDIS_AVAILABLE:
            redis_client.setex(key, ttl, json.dumps(data))
        else:
            _memory_cache[key] = data
    except Exception as e:
        print(f"Cache error: {e}")

def get_cached_response(key: str) -> Optional[Dict]:
    """Get cached response from Redis or memory"""
    try:
        if REDIS_AVAILABLE:
            cached = redis_client.get(key)
            return json.loads(cached) if cached else None
        else:
            return _memory_cache.get(key)
    except Exception as e:
        print(f"Cache retrieval error: {e}")
        return None 