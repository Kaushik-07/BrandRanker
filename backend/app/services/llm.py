import os
import json
from typing import List, Dict
import requests
from tenacity import retry, stop_after_attempt, wait_exponential
from app.utils.cache import cache_response, get_cached_response

class PerplexityService:
    def __init__(self):
        self.api_key = os.getenv("PERPLEXITY_API_KEY")
        self.base_url = "https://api.perplexity.ai/chat/completions"
        self.model = "sonar-pro"  # Working model!

    def get_rankings(self, brands: List[str], category: str) -> Dict:
        """Fetches rankings with caching."""
        cache_key = f"rankings:{':'.join(sorted(brands))}:{category}"
        
        # Check cache first
        cached = get_cached_response(cache_key)
        if cached:
            print(f"📋 Cache hit for {category}")
            return cached

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        prompt = f"""
        Rank these brands for {category}: {', '.join(brands)}.
        Return ONLY a JSON object with:
        - 'rankings': {{"Brand1": 1, "Brand2": 2}} (1=best)
        - 'reason': "Brief explanation"
        Example: {{"rankings": {{"Nike": 1}}, "reason": "Superior comfort"}}
        """
        
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.0  # Fully deterministic
        }

        try:
            print(f"🚀 Calling Perplexity API with model: {self.model}")
            print(f"📝 Payload: {json.dumps(payload, indent=2)}")
            
            response = requests.post(self.base_url, json=payload, headers=headers)
            response.raise_for_status()
            result = response.json()
            print(f"✅ Raw API response: {json.dumps(result, indent=2)}")
            
            # Safer JSON parsing
            try:
                content = json.loads(result["choices"][0]["message"]["content"])
                if not isinstance(content, dict):
                    raise ValueError("Response is not a dictionary")
                
                # Cache for 1 hour
                cache_response(cache_key, content, ttl=3600)
                return content
                
            except (json.JSONDecodeError, KeyError) as e:
                print(f"❌ JSON parsing error: {str(e)}")
                raise ValueError(f"Malformed API response: {str(e)}")

        except requests.exceptions.RequestException as e:
            print(f"❌ API call failed: {str(e)}")
            raise ValueError(f"Perplexity API error: {str(e)}")
        except Exception as e:
            print(f"❌ Unexpected error: {str(e)}")
            raise ValueError(f"Unexpected error: {str(e)}") 