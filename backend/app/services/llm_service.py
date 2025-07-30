import os
import asyncio
import hashlib
import time
import re
from typing import List, Dict, Any, Optional
import httpx
from ..core.config import settings
import json
import redis
from functools import lru_cache
from .performance_monitor import performance_monitor
from collections import deque


class LLMService:
    def __init__(self):
        self.perplexity_api_key = settings.PERPLEXITY_API_KEY
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            decode_responses=True
        )
        self.request_timestamps = deque(maxlen=50)
        self.session_semaphore = asyncio.Semaphore(5)
        self.performance_monitor = performance_monitor
        
    def _initialize_brand_knowledge(self) -> Dict[str, Dict[str, Dict[str, Any]]]:
        """Initialize comprehensive brand knowledge for intelligent fallback"""
        return {
            "sneakers": {
                "nike": {"rank": 1, "score": 5, "reason": "Market leader with strong brand recognition, innovation in Air technology, and global presence"},
                "adidas": {"rank": 2, "score": 4, "reason": "Strong heritage, Boost technology, and lifestyle appeal"},
                "puma": {"rank": 3, "score": 3, "reason": "Good performance in specific segments, affordable pricing"},
                "reebok": {"rank": 4, "score": 2, "reason": "Classic brand with niche following, CrossFit partnership"},
                "under armour": {"rank": 5, "score": 1, "reason": "Performance-focused but smaller market share"}
            },
            "smartphones": {
                "apple": {"rank": 1, "score": 5, "reason": "Premium brand with strong ecosystem, innovation, and customer loyalty"},
                "samsung": {"rank": 2, "score": 4, "reason": "Diverse product range, strong Android presence, innovation in foldables"},
                "google": {"rank": 3, "score": 3, "reason": "Clean software experience, AI integration, Pixel camera technology"},
                "xiaomi": {"rank": 4, "score": 2, "reason": "Value proposition, global reach, competitive pricing"},
                "oneplus": {"rank": 5, "score": 1, "reason": "Performance-focused but limited market share"}
            },
            "coffee": {
                "starbucks": {"rank": 1, "score": 5, "reason": "Global coffee chain leader with strong brand, premium positioning"},
                "dunkin": {"rank": 2, "score": 4, "reason": "Strong regional presence, value proposition, donut association"},
                "peet's": {"rank": 3, "score": 3, "reason": "Premium coffee quality, heritage, artisanal approach"},
                "caribou": {"rank": 4, "score": 2, "reason": "Regional strength, quality focus, cozy atmosphere"},
                "tim hortons": {"rank": 5, "score": 1, "reason": "Canadian market leader with limited global reach"}
            },
            "laptops": {
                "apple": {"rank": 1, "score": 5, "reason": "Premium build quality, macOS ecosystem, M-series chips"},
                "dell": {"rank": 2, "score": 4, "reason": "Diverse product range, enterprise focus, reliable support"},
                "hp": {"rank": 3, "score": 3, "reason": "Good value proposition, wide range, business focus"},
                "lenovo": {"rank": 4, "score": 2, "reason": "ThinkPad heritage, business laptops, innovation"},
                "asus": {"rank": 5, "score": 1, "reason": "Gaming focus, competitive pricing, varied quality"}
            },
            "cars": {
                "toyota": {"rank": 1, "score": 5, "reason": "Reliability leader, hybrid technology, global presence"},
                "honda": {"rank": 2, "score": 4, "reason": "Quality engineering, fuel efficiency, safety focus"},
                "ford": {"rank": 3, "score": 3, "reason": "American heritage, truck leadership, innovation"},
                "bmw": {"rank": 4, "score": 2, "reason": "Luxury performance, driving dynamics, premium brand"},
                "mercedes": {"rank": 5, "score": 1, "reason": "Luxury leader, technology innovation, comfort focus"}
            }
        }
        
    def _get_cache_key(self, companies: List[str], category: str) -> str:
        """Generate cache key for consistent caching"""
        companies_str = ','.join(sorted(companies)).lower()
        category_str = category.lower()
        cache_key = f"ranking:{companies_str}:{category_str}"
        return hashlib.md5(cache_key.encode()).hexdigest()
    
    async def _get_from_cache(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Get result from cache (Redis or in-memory)"""
        try:
            if self.redis_client:
                cached_result = self.redis_client.get(cache_key)
                if cached_result:
                    print(f"🎯 Cache HIT for key: {cache_key}")
                    self.performance_monitor.track_cache_hit()
                    return json.loads(cached_result)
            else:
                # In-memory cache is removed, so this block will always be skipped
                pass
        except Exception as e:
            print(f"Cache retrieval error: {e}")
        
        print(f"❌ Cache MISS for key: {cache_key}")
        self.performance_monitor.track_cache_miss()
        return None
    
    async def _set_cache(self, cache_key: str, result: Dict[str, Any]) -> None:
        """Set result in cache with TTL"""
        try:
            if self.redis_client:
                self.redis_client.setex(cache_key, 3600, json.dumps(result)) # TTL is 1 hour
                print(f"💾 Cached in Redis: {cache_key}")
            else:
                # In-memory cache is removed, so this block will always be skipped
                pass
            
            # Update cache size metric
            # This metric is no longer directly applicable to Redis, but keeping it for now
            # as it was part of the original code.
            # If Redis is unavailable, this will be 0.
            cache_size = 0 # len(self._cache) if not self.redis_available else len(self.redis_client.keys())
            self.performance_monitor.update_cache_size(cache_size)
        except Exception as e:
            print(f"Cache setting error: {e}")
    
    def _check_rate_limit(self) -> bool:
        """Check if we're within rate limits"""
        current_time = time.time()
        # Remove old timestamps outside the window
        self.request_timestamps = deque(ts for ts in self.request_timestamps 
                                 if current_time - ts < 60) # Rate limit window is 1 minute
        
        remaining_capacity = 50 - len(self.request_timestamps) # Max requests per window is 50
        self.performance_monitor.update_rate_limit_remaining(remaining_capacity)
        
        if len(self.request_timestamps) >= 50: # Max requests per window is 50
            print(f"🚫 Rate limit exceeded: {len(self.request_timestamps)} requests in window")
            self.performance_monitor.track_rate_limit_hit()
            return False
        
        return True

    @performance_monitor.track_request
    async def _make_perplexity_request(self, companies: List[str], category: str) -> Dict[str, Any]:
        """Make request to Perplexity API for brand ranking"""
        async with httpx.AsyncClient() as client:
            prompt = f"Rank {', '.join(companies)} for {category}. Return ONLY a JSON with rankings in this format: {{\"rankings\": [{{\"rank\": 1, \"company\": \"{companies[0]}\", \"reason\": \"explanation\"}}, {{\"rank\": 2, \"company\": \"{companies[1]}\", \"reason\": \"explanation\"}}]}}"
            
            response = await client.post(
                "https://api.perplexity.ai/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.perplexity_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.1-sonar-small-128k-online",
                    "messages": [
                        {"role": "system", "content": "You are a brand ranking expert. Always respond with valid JSON only."},
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 500
                },
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]

    async def _make_llm_request(self, companies: List[str], category: str) -> Dict[str, Any]:
        """Make LLM request to Perplexity API"""
        try:
            # Use Perplexity as primary (and only) LLM provider
            return await self._make_perplexity_request(companies, category)
        except Exception as e:
            print(f"❌ Perplexity API error: {e}")
            # Use intelligent fallback instead of OpenAI
            return self._get_intelligent_fallback(companies, category)

    def _standardize_terminology(self, category: str) -> str:
        """Standardize category terminology for consistency"""
        terminology_map = {
            'tshirts': 'T-Shirts',
            't-shirts': 'T-Shirts',
            't shirts': 'T-Shirts',
            'sneakers': 'Sneakers',
            'running shoes': 'Running Shoes',
            'basketball shoes': 'Basketball Shoes',
            'smartphones': 'Smartphones',
            'phones': 'Smartphones',
            'laptops': 'Laptops',
            'computers': 'Laptops',
            'coffee': 'Coffee',
            'cars': 'Cars',
            'automobiles': 'Cars',
            'electronics': 'Electronics',
            'apparel': 'Apparel',
            'clothing': 'Apparel'
        }
        
        return terminology_map.get(category.lower(), category.title())

    async def rank_brands_for_category(self, companies: List[str], category: str) -> Dict[str, Any]:
        """Rank brands for a specific category using priority LLM system"""
        # Standardize category terminology
        standardized_category = self._standardize_terminology(category)
        
        # Create cache key with standardized category
        cache_key = f"ranking:{':'.join(sorted(companies))}:{standardized_category}"
        
        # Check cache first
        cached_result = await self._get_from_cache(cache_key)
        if cached_result:
            return cached_result
        
        # Check rate limits
        await self._check_rate_limit()
        
        # Create optimized prompt
        prompt = self._create_optimized_prompt(companies, standardized_category)
        
        try:
            # Make LLM request with priority system
            response = await self._make_llm_request(companies, standardized_category)
            
            # Parse response
            rankings = self._parse_llm_response(response, companies)
            
            if rankings:
                # Cache successful result
                await self._set_cache(cache_key, {
                    'rankings': rankings,
                    'category': standardized_category,
                    'companies': companies,
                    'llm_metadata': {
                        'model_used': response.get('model', 'unknown'),
                        'response_time': response.get('response_time', 0),
                        'cache_hit': False
                    }
                })
                
                return {
                    'rankings': rankings,
                    'category': standardized_category,
                    'companies': companies
                }
            else:
                # Use intelligent fallback
                return self._get_intelligent_fallback(companies, standardized_category)
            
        except Exception as e:
            print(f"❌ Error ranking brands for {standardized_category}: {e}")
            # Use intelligent fallback
            return self._get_intelligent_fallback(companies, standardized_category)

    def _parse_llm_response(self, response: Dict[str, Any], companies: List[str]) -> List[Dict[str, Any]]:
        """Parse LLM response to extract rankings"""
        try:
            content = response.get('content', '') if isinstance(response, dict) else str(response)
            if not content:
                print("⚠️ Empty response content")
                return self._get_intelligent_fallback(companies, "Unknown Category")['rankings']
            
            # Multiple regex patterns to handle different response formats
            patterns = [
                r'(\d+)\.\s*([^-\n]+?)(?:\s*-\s*([^\n]+))?',  # 1. Brand - Reason
                r'(\d+)\s*([^-\n]+?)(?:\s*-\s*([^\n]+))?',    # 1 Brand - Reason
                r'rank\s*(\d+):\s*([^-\n]+)',                 # Rank 1: Brand
                r'(\d+)\)\s*([^-\n]+)',                       # 1) Brand
            ]
            
            rankings = []
            for pattern in patterns:
                matches = re.findall(pattern, content, re.IGNORECASE)
                if matches:
                    for match in matches:
                        try:
                            rank = int(match[0])
                            brand = match[1].strip()
                            
                            # Find matching company (case-insensitive)
                            matching_company = None
                            for company in companies:
                                if company.lower() in brand.lower() or brand.lower() in company.lower():
                                    matching_company = company
                                    break
                            
                            if matching_company:
                                rankings.append({
                                    'rank': rank,
                                    'company': matching_company,
                                    'reason': match[2].strip() if len(match) > 2 else ''
                                })
                        except (ValueError, IndexError):
                            continue
                    
                    if rankings:
                        # Sort by rank and ensure all companies are included
                        rankings.sort(key=lambda x: x['rank'])
                        
                        # Add missing companies with default ranks
                        existing_companies = {r['company'] for r in rankings}
                        for company in companies:
                            if company not in existing_companies:
                                rankings.append({
                                    'rank': len(rankings) + 1,
                                    'company': company,
                                    'reason': 'Ranked based on market position'
                                })
                        
                        return rankings
            
            # If no patterns match, try to extract from intelligent fallback
            print("⚠️ Could not parse LLM response, using fallback")
            return self._get_intelligent_fallback(companies, "Unknown Category")['rankings']
            
        except Exception as e:
            print(f"❌ Error parsing LLM response: {e}")
            return self._get_intelligent_fallback(companies, "Unknown Category")['rankings']

    def _create_optimized_prompt(self, companies: List[str], category: str) -> str:
        """Create an optimized prompt for brand ranking"""
        companies_str = ", ".join(companies)
        
        prompt = f"""Please rank the following brands in the {category} category: {companies_str}

Consider these factors:
1. Market share and brand recognition
2. Product quality and innovation
3. Customer satisfaction and loyalty
4. Financial performance and growth
5. Competitive positioning

Please provide a clear ranking from 1st to {len(companies)}th place with brief reasoning for each brand's position.

Format your response like this:
1. [Brand Name] - [Brief reason for ranking]
2. [Brand Name] - [Brief reason for ranking]
3. [Brand Name] - [Brief reason for ranking]
etc.

Make sure to rank ALL {len(companies)} brands mentioned."""
        
        return prompt

    def _get_intelligent_fallback(self, companies: List[str], category: str) -> Dict[str, Any]:
        """Provide intelligent fallback data with standardized terminology"""
        standardized_category = self._standardize_terminology(category)
        
        # Enhanced brand knowledge with standardized categories
        self.brand_knowledge = {
            "T-Shirts": {
                "Nike": {"rank": 1, "reason": "Strong brand recognition and quality"},
                "Adidas": {"rank": 2, "reason": "Good market presence and style"},
                "Puma": {"rank": 3, "reason": "Competitive but smaller market share"},
                "H&M": {"rank": 1, "reason": "Affordable fashion with wide appeal"},
                "Zara": {"rank": 2, "reason": "Fast fashion leader with trendy designs"},
                "Mango": {"rank": 3, "reason": "Contemporary style with good quality"},
                "Levis": {"rank": 1, "reason": "Classic denim brand with heritage"},
                "mango": {"rank": 2, "reason": "Modern fashion with good value"},
                "Souled Store": {"rank": 3, "reason": "Niche brand with unique designs"}
            },
            "Sneakers": {
                "Nike": {"rank": 1, "reason": "Market leader in athletic footwear"},
                "Adidas": {"rank": 2, "reason": "Strong competitor with innovative designs"},
                "Puma": {"rank": 3, "reason": "Good quality with competitive pricing"},
                "New Balance": {"rank": 4, "reason": "Comfort-focused athletic shoes"},
                "Converse": {"rank": 5, "reason": "Classic casual sneakers"}
            },
            "Smartphones": {
                "Apple": {"rank": 1, "reason": "Premium quality and ecosystem"},
                "Samsung": {"rank": 2, "reason": "Innovative features and variety"},
                "Google": {"rank": 3, "reason": "Clean Android experience"},
                "OnePlus": {"rank": 4, "reason": "Good value for performance"},
                "Xiaomi": {"rank": 5, "reason": "Affordable with good features"}
            },
            "Laptops": {
                "Apple": {"rank": 1, "reason": "Premium build quality and performance"},
                "Dell": {"rank": 2, "reason": "Reliable business laptops"},
                "HP": {"rank": 3, "reason": "Good value and variety"},
                "Lenovo": {"rank": 4, "reason": "ThinkPad reliability"},
                "ASUS": {"rank": 5, "reason": "Gaming and performance focus"}
            },
            "Coffee": {
                "Starbucks": {"rank": 1, "reason": "Global brand recognition"},
                "Dunkin": {"rank": 2, "reason": "Affordable and convenient"},
                "Peet's": {"rank": 3, "reason": "Premium coffee quality"},
                "Tim Hortons": {"rank": 4, "reason": "Canadian favorite"},
                "Caribou": {"rank": 5, "reason": "Regional specialty coffee"}
            },
            "Cars": {
                "Toyota": {"rank": 1, "reason": "Reliability and fuel efficiency"},
                "Honda": {"rank": 2, "reason": "Good value and safety"},
                "Ford": {"rank": 3, "reason": "American heritage and trucks"},
                "BMW": {"rank": 4, "reason": "Luxury and performance"},
                "Mercedes": {"rank": 5, "reason": "Premium luxury vehicles"}
            },
            "Jeans": {
                "Levis": {"rank": 1, "reason": "Classic denim heritage"},
                "H&M": {"rank": 2, "reason": "Affordable fashion"},
                "mango": {"rank": 3, "reason": "Contemporary style"},
                "Zara": {"rank": 2, "reason": "Fast fashion quality"},
                "Gap": {"rank": 4, "reason": "Casual American style"}
            },
            "Shirts": {
                "H&M": {"rank": 1, "reason": "Affordable and trendy"},
                "Zara": {"rank": 2, "reason": "Fast fashion leader"},
                "mango": {"rank": 3, "reason": "Contemporary style"},
                "Uniqlo": {"rank": 4, "reason": "Quality basics"},
                "Gap": {"rank": 5, "reason": "Casual American style"}
            },
            "Oversize T-Shirt": {
                "H&M": {"rank": 1, "reason": "Trendy oversized fits"},
                "Zara": {"rank": 2, "reason": "Fashion-forward designs"},
                "Mango": {"rank": 3, "reason": "Contemporary oversized styles"},
                "Souled Store": {"rank": 2, "reason": "Unique oversized designs"},
                "mango": {"rank": 3, "reason": "Modern oversized fashion"}
            }
        }
        
        # Get rankings for the standardized category
        category_rankings = self.brand_knowledge.get(standardized_category, {})
        
        # Create rankings for the requested companies
        rankings = []
        for i, company in enumerate(companies):
            if company in category_rankings:
                rankings.append({
                    'rank': category_rankings[company]['rank'],
                    'company': company,
                    'reason': category_rankings[company]['reason']
                })
            else:
                # Default ranking for unknown companies
                rankings.append({
                    'rank': i + 1,
                    'company': company,
                    'reason': f'Ranked based on market position in {standardized_category}'
                })
        
        # Sort by rank and ensure all companies are included
        rankings.sort(key=lambda x: x['rank'])
        
        # Calculate average ranks
        company_ranks = {r['company']: r['rank'] for r in rankings}
        
        return {
            'rankings': rankings,
            'company_ranks': company_ranks,
            'category': standardized_category
        }

    async def rank_brands_parallel(self, companies: List[str], categories: List[str]) -> Dict[str, Any]:
        """Rank brands across multiple categories in parallel"""
        print(f"🚀 Starting parallel ranking for {len(companies)} companies across {len(categories)} categories")
        
        # Create tasks for each category
        tasks = []
        for category in categories:
            task = self.rank_brands_for_category(companies, category)
            tasks.append(task)
        
        # Execute all tasks in parallel
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        category_results = {}
        successful_categories = 0
        
        for i, result in enumerate(results):
            category = categories[i]
            if isinstance(result, Exception):
                print(f"❌ Error ranking category {category}: {result}")
                # Use fallback for failed categories
                fallback_result = self._get_intelligent_fallback(companies, category)
                category_results[category] = fallback_result
            else:
                category_results[category] = result
                successful_categories += 1
        
        print(f"✅ Completed parallel ranking with {successful_categories} categories")
        
        # Calculate average ranks
        company_ranks = {}
        for company in companies:
            total_rank = 0
            valid_categories = 0
            
            for category in categories:
                if category in category_results:
                    category_data = category_results[category]
                    if "rankings" in category_data and category_data["rankings"]:
                        # Find the company's rank in this category
                        for ranking in category_data["rankings"]:
                            if ranking["company"] == company:
                                total_rank += ranking["rank"]
                                valid_categories += 1
                                break
            
            if valid_categories > 0:
                company_ranks[company] = total_rank / valid_categories
            else:
                company_ranks[company] = 0.0
        
        return {
            "results": category_results,
            "average_ranks": company_ranks
        } 