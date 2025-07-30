import asyncio
import httpx
import json
from typing import List, Tuple, Dict, Any
from ..core.config import settings
import logging

logger = logging.getLogger(__name__)

class ValidationService:
    def __init__(self):
        self.perplexity_api_key = settings.PERPLEXITY_API_KEY
        logger.info(f"ValidationService initialized with Perplexity API key: {'SET' if self.perplexity_api_key else 'NOT SET'}")
        
    async def validate_companies(self, companies: List[str]) -> Tuple[bool, List[str], str]:
        """
        Validate if companies are real brands/companies using AI
        Returns: (is_valid, valid_companies, error_message)
        """
        try:
            # Use AI to validate companies
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

            # Try Perplexity API for validation
            try:
                logger.info(f"Attempting Perplexity API validation for companies: {companies}")
                response = await self._make_perplexity_request(prompt, system_content)
                logger.info(f"Perplexity API response received: {response}")
                
                # Parse AI response
                try:
                    content = response.get('content', '{}')
                    logger.info(f"Raw AI response content: {content}")
                    
                    # Clean the response to extract JSON
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
                        return False, [], f"No valid companies found. {reason}"
                    
                    if invalid_companies:
                        return False, [], f"Invalid companies: {', '.join(invalid_companies)}. {reason}"
                    
                    return True, valid_companies, ""
                    
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse AI response as JSON: {e}")
                    logger.error(f"Raw response: {response}")
                    return False, [], "Unable to validate companies. Please try again."
                    
            except Exception as e:
                logger.error(f"Perplexity validation failed: {e}")
                return False, [], "Unable to validate companies. Please try again."
                
        except Exception as e:
            logger.error(f"Company validation error: {e}")
            return False, [], "Validation service error. Please try again."

    async def validate_categories(self, categories: List[str]) -> Tuple[bool, List[str], str]:
        """
        Validate if categories are real product categories using AI
        Returns: (is_valid, valid_categories, error_message)
        """
        try:
            # Use AI to validate categories
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

            # Try Perplexity API for validation
            try:
                logger.info(f"Attempting Perplexity API validation for categories: {categories}")
                response = await self._make_perplexity_request(prompt, system_content)
                logger.info(f"Perplexity API response received: {response}")
                
                # Parse AI response
                try:
                    content = response.get('content', '{}')
                    logger.info(f"Raw AI response content: {content}")
                    
                    # Clean the response to extract JSON
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
                        return False, [], f"No valid categories found. {reason}"
                    
                    if invalid_categories:
                        return False, [], f"Invalid categories: {', '.join(invalid_categories)}. {reason}"
                    
                    return True, valid_categories, ""
                    
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse AI response as JSON: {e}")
                    logger.error(f"Raw response: {response}")
                    return False, [], "Unable to validate categories. Please try again."
                    
            except Exception as e:
                logger.error(f"Perplexity validation failed: {e}")
                return False, [], "Unable to validate categories. Please try again."
                
        except Exception as e:
            logger.error(f"Category validation error: {e}")
            return False, [], "Validation service error. Please try again."

    async def _make_perplexity_request(self, prompt: str, system_content: str) -> Dict[str, Any]:
        """Make request to Perplexity API"""
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
                    timeout=10.0
                )
                logger.info(f"Perplexity API response status: {response.status_code}")
                response.raise_for_status()
                result = response.json()["choices"][0]["message"]
                logger.info(f"Perplexity API response content: {result}")
                return result
            except Exception as e:
                logger.error(f"Perplexity API request failed: {e}")
                raise 