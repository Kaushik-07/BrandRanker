from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from ..core.database import get_db
from ..models.user import User
from ..services.validation_service import ValidationService
from .deps import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
validation_service = ValidationService()

class ValidationRequest(BaseModel):
    companies: List[str] = []
    categories: List[str] = []

class ValidationResponse(BaseModel):
    valid: bool
    valid_items: List[str] = []
    invalid_items: List[str] = []
    error: str = ""

class PerformanceStatsResponse(BaseModel):
    cache_hits: int
    cache_misses: int
    api_calls: int
    total_requests: int
    cache_hit_rate: float
    cached_companies: int
    cached_categories: int

@router.get("/validation/performance", response_model=PerformanceStatsResponse)
async def get_validation_performance():
    """Get validation service performance statistics"""
    try:
        stats = validation_service.get_performance_stats()
        return PerformanceStatsResponse(**stats)
    except Exception as e:
        logger.error(f"Performance stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get performance statistics"
        )

@router.post("/validate/companies", response_model=ValidationResponse)
async def validate_companies(
    request: ValidationRequest,
    db: Session = Depends(get_db)
):
    """Validate companies using AI with intelligent caching"""
    try:
        if not request.companies:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No companies provided"
            )
        
        logger.info(f"Validating companies: {request.companies}")
        is_valid, valid_companies, error_message = await validation_service.validate_companies(request.companies)
        logger.info(f"Validation result: is_valid={is_valid}, valid_companies={valid_companies}, error={error_message}")
        
        if is_valid:
            return ValidationResponse(
                valid=True,
                valid_items=valid_companies,
                invalid_items=[],
                error=""
            )
        else:
            return ValidationResponse(
                valid=False,
                valid_items=[],
                invalid_items=request.companies,
                error=error_message
            )
            
    except Exception as e:
        logger.error(f"Company validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Validation service error"
        )

@router.post("/validate/categories", response_model=ValidationResponse)
async def validate_categories(
    request: ValidationRequest,
    db: Session = Depends(get_db)
):
    """Validate categories using AI with intelligent caching"""
    try:
        if not request.categories:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No categories provided"
            )
        
        is_valid, valid_categories, error_message = await validation_service.validate_categories(request.categories)
        
        if is_valid:
            return ValidationResponse(
                valid=True,
                valid_items=valid_categories,
                invalid_items=[],
                error=""
            )
        else:
            return ValidationResponse(
                valid=False,
                valid_items=[],
                invalid_items=request.categories,
                error=error_message
            )
            
    except Exception as e:
        logger.error(f"Category validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Validation service error"
        ) 