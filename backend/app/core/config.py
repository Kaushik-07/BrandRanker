from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./brandranker.db"
    DATABASE_PERSISTENT: bool = True
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours (24 * 60 minutes)
    
    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    
    # Perplexity (Priority 1)
    PERPLEXITY_API_KEY: Optional[str] = None
    
    # CORS
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000,http://localhost:8000,https://brand-ranker-app.web.app,https://brand-ranker-app.firebaseapp.com,https://brandranker.vercel.app,https://brandranker.netlify.app,https://brandranker-git-main-apoorv-verma.vercel.app,https://brandranker-apoorv-verma.vercel.app"
    
    # Redis (for caching and rate limiting)
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    
    # Debug mode
    DEBUG: bool = False
    
    class Config:
        env_file = ".env"


settings = Settings() 