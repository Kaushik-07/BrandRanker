from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


class UserBase(BaseModel):
    email: str
    username: str


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    username: str
    password: str


class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class ExperimentBase(BaseModel):
    companies: List[str] = Field(..., min_items=1, max_items=5)
    categories: List[str] = Field(..., min_items=1, max_items=3)


class ExperimentCreate(ExperimentBase):
    pass


class RankingResult(BaseModel):
    company: str
    rank: int
    reason: str


class CategoryResult(BaseModel):
    category: str
    rankings: List[RankingResult]


class ExperimentResult(BaseModel):
    id: int
    companies: List[str]
    categories: List[str]
    results: Dict[str, Any]
    average_ranks: Dict[str, float]
    created_at: datetime
    
    class Config:
        from_attributes = True


class ExperimentResponse(BaseModel):
    experiment: ExperimentResult
    message: str = "Experiment completed successfully" 