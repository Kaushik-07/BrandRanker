import asyncio
import httpx
import json
import hashlib
import time
from typing import List, Tuple, Dict, Any, Set
from ..core.config import settings
import logging

logger = logging.getLogger(__name__)

class ValidationService:
    def __init__(self):
        self.perplexity_api_key = settings.PERPLEXITY_API_KEY
        # In-memory cache for instant validation
        self._company_cache: Dict[str, bool] = {}
        self._category_cache: Dict[str, bool] = {}
        # Performance tracking
        self._cache_hits = 0
        self._cache_misses = 0
        self._api_calls = 0
        logger.info(f"ValidationService initialized with Perplexity API key: {'SET' if self.perplexity_api_key else 'NOT SET'}")
        
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get performance statistics"""
        total_requests = self._cache_hits + self._cache_misses
        cache_hit_rate = (self._cache_hits / total_requests * 100) if total_requests > 0 else 0
        
        return {
            "cache_hits": self._cache_hits,
            "cache_misses": self._cache_misses,
            "api_calls": self._api_calls,
            "total_requests": total_requests,
            "cache_hit_rate": round(cache_hit_rate, 2),
            "cached_companies": len(self._company_cache),
            "cached_categories": len(self._category_cache)
        }
    
    def _normalize_item(self, item: str) -> str:
        """Normalize item name for consistent caching"""
        return item.strip().lower()
    
    async def validate_companies(self, companies: List[str]) -> Tuple[bool, List[str], str]:
        """
        Validate companies with intelligent caching for maximum performance
        Returns: (is_valid, valid_companies, error_message)
        """
        start_time = time.time()
        try:
            if not companies:
                return False, [], "No companies provided"
            
            # Check cache first for instant responses
            valid_companies = []
            invalid_companies = []
            uncached_companies = []
            
            for company in companies:
                normalized_company = self._normalize_item(company)
                
                if normalized_company in self._company_cache:
                    self._cache_hits += 1
                    if self._company_cache[normalized_company]:
                        valid_companies.append(company)
                    else:
                        invalid_companies.append(company)
                else:
                    self._cache_misses += 1
                    uncached_companies.append(company)
            
            # If all companies are cached, return immediately
            if not uncached_companies:
                if valid_companies and not invalid_companies:
                    logger.info(f"All companies validated from cache in {time.time() - start_time:.3f}s")
                    return True, valid_companies, ""
                else:
                    logger.info(f"Companies validation failed from cache in {time.time() - start_time:.3f}s")
                    return False, valid_companies, f"Invalid companies: {', '.join(invalid_companies)}"
            
            # Batch validate uncached companies for efficiency
            if uncached_companies:
                logger.info(f"Validating uncached companies: {uncached_companies}")
                self._api_calls += 1
                batch_valid, batch_valid_items, batch_invalid_items, error = await self._validate_companies_batch(uncached_companies)
                
                if not batch_valid:
                    return False, valid_companies, error
                
                # Cache results for future use
                for company in uncached_companies:
                    normalized_company = self._normalize_item(company)
                    is_valid = company in batch_valid_items
                    self._company_cache[normalized_company] = is_valid
                    
                    if is_valid:
                        valid_companies.append(company)
                    else:
                        invalid_companies.append(company)
            
            # Return final result
            if valid_companies and not invalid_companies:
                logger.info(f"Companies validation completed in {time.time() - start_time:.3f}s")
                return True, valid_companies, ""
            else:
                logger.info(f"Companies validation failed in {time.time() - start_time:.3f}s")
                return False, valid_companies, f"Invalid companies: {', '.join(invalid_companies)}"
                
        except Exception as e:
            logger.error(f"Company validation error: {e}")
            return False, [], "Validation service error. Please try again."

    async def validate_categories(self, categories: List[str]) -> Tuple[bool, List[str], str]:
        """
        Validate categories with intelligent caching for maximum performance
        Returns: (is_valid, valid_categories, error_message)
        """
        start_time = time.time()
        try:
            if not categories:
                return False, [], "No categories provided"
            
            # Check cache first for instant responses
            valid_categories = []
            invalid_categories = []
            uncached_categories = []
            
            for category in categories:
                normalized_category = self._normalize_item(category)
                
                if normalized_category in self._category_cache:
                    self._cache_hits += 1
                    if self._category_cache[normalized_category]:
                        valid_categories.append(category)
                    else:
                        invalid_categories.append(category)
                else:
                    self._cache_misses += 1
                    uncached_categories.append(category)
            
            # If all categories are cached, return immediately
            if not uncached_categories:
                if valid_categories and not invalid_categories:
                    logger.info(f"All categories validated from cache in {time.time() - start_time:.3f}s")
                    return True, valid_categories, ""
                else:
                    logger.info(f"Categories validation failed from cache in {time.time() - start_time:.3f}s")
                    return False, valid_categories, f"Invalid categories: {', '.join(invalid_categories)}"
            
            # Batch validate uncached categories for efficiency
            if uncached_categories:
                logger.info(f"Validating uncached categories: {uncached_categories}")
                self._api_calls += 1
                batch_valid, batch_valid_items, batch_invalid_items, error = await self._validate_categories_batch(uncached_categories)
                
                if not batch_valid:
                    return False, valid_categories, error
                
                # Cache results for future use
                for category in uncached_categories:
                    normalized_category = self._normalize_item(category)
                    is_valid = category in batch_valid_items
                    self._category_cache[normalized_category] = is_valid
                    
                    if is_valid:
                        valid_categories.append(category)
                    else:
                        invalid_categories.append(category)
            
            # Return final result
            if valid_categories and not invalid_categories:
                logger.info(f"Categories validation completed in {time.time() - start_time:.3f}s")
                return True, valid_categories, ""
            else:
                logger.info(f"Categories validation failed in {time.time() - start_time:.3f}s")
                return False, valid_categories, f"Invalid categories: {', '.join(invalid_categories)}"
                
        except Exception as e:
            logger.error(f"Category validation error: {e}")
            return False, [], "Validation service error. Please try again."

    async def _validate_companies_batch(self, companies: List[str]) -> Tuple[bool, List[str], List[str], str]:
        """Validate a batch of companies using AI for efficiency"""
        try:
            prompt = f"""Validate if these are real companies/brands. Respond ONLY with valid JSON in this exact format:
{{
    "valid_companies": ["list of real companies"],
    "invalid_companies": ["list of fake/invalid companies"],
    "reason": "brief explanation"
}}

Companies to validate: {', '.join(companies)}

Rules:
- Only include well-known, real companies/brands that can be ranked in product categories
- Valid examples: Nike, Adidas, Apple, Samsung, H&M, Zara, Starbucks, Toyota, BMW
- Exclude single letters, random characters, or obvious fake names like "abc", "def", "adffg", "gggggg"
- Companies should be recognizable brands that consumers would know
- If a company name is unclear or fake, mark it as invalid
- Respond with ONLY the JSON, no other text"""

            system_content = "You are a company validation expert. You must respond with ONLY valid JSON, no other text or explanations."

            response = await self._make_perplexity_request(prompt, system_content)
            
            # Parse AI response
            content = response.get('content', '{}')
            content = content.strip()
            if content.startswith('```json'):
                content = content[7:]
            if content.endswith('```'):
                content = content[:-3]
            content = content.strip()
            
            result = json.loads(content)
            valid_companies = result.get('valid_companies', [])
            invalid_companies = result.get('invalid_companies', [])
            reason = result.get('reason', '')
            
            if not valid_companies:
                return False, [], companies, f"No valid companies found. {reason}"
            
            if invalid_companies:
                return False, valid_companies, invalid_companies, f"Invalid companies: {', '.join(invalid_companies)}. {reason}"
            
            return True, valid_companies, invalid_companies, ""
            
        except Exception as e:
            logger.error(f"Batch company validation error: {e}")
            return False, [], companies, "Unable to validate companies. Please try again."

    async def _validate_categories_batch(self, categories: List[str]) -> Tuple[bool, List[str], List[str], str]:
        """Validate a batch of categories using AI for efficiency"""
        try:
            prompt = f"""Validate if these are real product categories. Respond ONLY with valid JSON in this exact format:
{{
    "valid_categories": ["list of real product categories"],
    "invalid_categories": ["list of fake/invalid categories"],
    "reason": "brief explanation"
}}

Categories to validate: {', '.join(categories)}

Rules:
- Only include real product categories that companies can be ranked in
- Valid examples: Smartphones, Laptops, Sneakers, T-Shirts, Coffee, Cars, Jeans, Shirts
- Exclude single letters, random characters, or obvious fake categories like "abc", "def", "adffg", "gggggg"
- Categories should be specific enough for meaningful brand comparison
- If a category is unclear or fake, mark it as invalid
- Respond with ONLY the JSON, no other text"""

            system_content = "You are a product category validation expert. You must respond with ONLY valid JSON, no other text or explanations."

            response = await self._make_perplexity_request(prompt, system_content)
            
            # Parse AI response
            content = response.get('content', '{}')
            content = content.strip()
            if content.startswith('```json'):
                content = content[7:]
            if content.endswith('```'):
                content = content[:-3]
            content = content.strip()
            
            result = json.loads(content)
            valid_categories = result.get('valid_categories', [])
            invalid_categories = result.get('invalid_categories', [])
            reason = result.get('reason', '')
            
            if not valid_categories:
                return False, [], categories, f"No valid categories found. {reason}"
            
            if invalid_categories:
                return False, valid_categories, invalid_categories, f"Invalid categories: {', '.join(invalid_categories)}. {reason}"
            
            return True, valid_categories, invalid_categories, ""
            
        except Exception as e:
            logger.error(f"Batch category validation error: {e}")
            return False, [], categories, "Unable to validate categories. Please try again."

    async def _make_perplexity_request(self, prompt: str, system_content: str) -> Dict[str, Any]:
        """Make request to Perplexity API with optimized timeout"""
        logger.info(f"Making Perplexity API request with key: {'SET' if self.perplexity_api_key else 'NOT SET'}")
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    "https://api.perplexity.ai/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.perplexity_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "sonar-pro",
                        "messages": [
                            {"role": "system", "content": system_content},
                            {"role": "user", "content": prompt}
                        ],
                        "max_tokens": 500
                    },
                    timeout=8.0  # Reduced timeout for faster response
                )
                logger.info(f"Perplexity API response status: {response.status_code}")
                response.raise_for_status()
                result = response.json()["choices"][0]["message"]
                logger.info(f"Perplexity API response content: {result}")
                return result
            except Exception as e:
                logger.error(f"Perplexity API request failed: {e}")
                raise