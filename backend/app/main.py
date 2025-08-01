from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, validator
from app.services.llm import PerplexityService
from app.api import auth, experiments
from app.models.user import User as DBUser
from app.core.database import get_db
from sqlalchemy.orm import Session
from typing import List, Dict, Optional, Any
from dotenv import load_dotenv
from datetime import datetime
from jose import JWTError, jwt
from app.core.config import settings
import os

load_dotenv()  # Load environment variables

app = FastAPI()

# Enhanced CORS Setup - Comprehensive configuration for all APIs
origins = [
    "http://localhost:3000",                    # React dev server
    "http://localhost:3001",                    # Alternative dev port
    "http://localhost:8000",                    # Backend dev server
    "http://127.0.0.1:3000",                   # Local development
    "http://127.0.0.1:3001",                   # Alternative local dev
    "http://127.0.0.1:8000",                   # Local backend
    "https://brand-ranker-app.web.app",        # Deployed frontend
    "https://brand-ranker-app.firebaseapp.com", # Firebase alternative URL
    "https://brand-ranker-backend.onrender.com", # Backend URL (for testing)
    "https://brandranker.vercel.app",          # Vercel deployment
    "https://brandranker.netlify.app",         # Netlify deployment
    "*",  # Allow all origins for development/testing
]

# Get environment-specific origins
if os.getenv("ENVIRONMENT") == "production":
    # In production, be more restrictive
    origins = [
        "https://brand-ranker-app.web.app",
        "https://brand-ranker-app.firebaseapp.com",
        "https://brandranker.vercel.app",
        "https://brandranker.netlify.app",
    ]
elif os.getenv("ENVIRONMENT") == "development":
    # In development, allow localhost and common dev ports
    origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:8000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,              # Allow cookies/auth headers
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
        "Cache-Control",
        "Pragma",
        "Expires",
        "X-CSRF-Token",
        "X-API-Key",
        "X-Forwarded-For",
        "X-Real-IP",
        "X-Forwarded-Proto",
        "X-Forwarded-Host",
    ],
    expose_headers=[
        "Content-Type",
        "Content-Length",
        "Content-Range",
        "Content-Disposition",
        "Authorization",
        "X-Total-Count",
        "X-Page-Count",
        "X-Current-Page",
        "X-Per-Page",
        "X-Total-Pages",
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Credentials",
    ],
    max_age=86400,  # Cache preflight requests for 24 hours
)

# Include the auth router
app.include_router(auth.router, prefix="/api")

# Include the experiments router
app.include_router(experiments.router, prefix="/api")

# Models with validation
class RankingRequest(BaseModel):
    brands: List[str]
    categories: List[str]
    
    @validator('brands')
    def validate_brands(cls, v):
        if len(v) < 2:
            raise ValueError('At least 2 brands are required')
        if len(v) > 5:
            raise ValueError('Maximum 5 brands allowed')
        for brand in v:
            if not brand.strip():
                raise ValueError('Brand names cannot be empty')
            if len(brand) < 2:
                raise ValueError('Brand names must be at least 2 characters')
        return [brand.strip() for brand in v]
    
    @validator('categories')
    def validate_categories(cls, v):
        if len(v) < 1:
            raise ValueError('At least 1 category is required')
        if len(v) > 3:
            raise ValueError('Maximum 3 categories allowed')
        for category in v:
            if not category.strip():
                raise ValueError('Category names cannot be empty')
            if len(category) < 2:
                raise ValueError('Category names must be at least 2 characters')
        return [category.strip() for category in v]

class RankingResult(BaseModel):
    rankings: Dict[str, Dict[str, int]]  # {category: {brand: rank}}
    average_ranks: Dict[str, float]      # {brand: avg_rank}

class ExperimentCreate(BaseModel):
    companies: List[str]
    categories: List[str]

class ExperimentResult(BaseModel):
    id: int
    companies: List[str]
    categories: List[str]
    results: Dict[str, Any]  # {category: {rankings: {...}, reason: "..."}}
    average_ranks: Dict[str, float]
    created_at: str

class ExperimentResponse(BaseModel):
    experiment: ExperimentResult
    message: str

# Import Experiment model
from app.models.experiment import Experiment
from app.models import Base
from app.core.database import engine

# Initialize database tables on startup
@app.on_event("startup")
async def startup_event():
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables initialized successfully!")
    except Exception as e:
        print(f"❌ Database initialization error: {e}")

@app.middleware("http")
async def handle_errors(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        print(f"❌ Error handling request: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Internal error: {str(e)}"}
        )

# CORS preflight handler for all endpoints
@app.options("/{full_path:path}")
async def options_handler(request: Request):
    """Handle CORS preflight requests for all endpoints"""
    return JSONResponse(
        status_code=200,
        content={"message": "CORS preflight successful"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH",
            "Access-Control-Allow-Headers": "Accept, Accept-Language, Content-Language, Content-Type, Authorization, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers, Cache-Control, Pragma, Expires, X-CSRF-Token, X-API-Key",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "86400",
        }
    )

# Helper function to get user from token
def get_user_from_token(request: Request, db: Session = Depends(get_db)):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Fetch user from database
        user = db.query(DBUser).filter(DBUser.username == username).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def validate_ranking(response: dict, brands: list, category: str) -> dict:
    """Validate LLM response and ensure all brands are ranked"""
    try:
        if not response or "rankings" not in response:
            raise ValueError(f"Invalid response structure for {category}")
        
        rankings = response["rankings"]
        
        # Check if all brands are present
        missing_brands = [brand for brand in brands if brand not in rankings]
        if missing_brands:
            print(f"⚠️ Warning: Missing brands in {category} rankings: {missing_brands}")
            # Add missing brands with default rank (last place)
            max_rank = max(rankings.values()) if rankings else 0
            for brand in missing_brands:
                rankings[brand] = max_rank + 1
        
        # Ensure rankings are integers
        for brand, rank in rankings.items():
            if not isinstance(rank, (int, float)):
                rankings[brand] = int(rank) if rank else len(brands)
        
        return response
    except Exception as e:
        print(f"❌ Error validating rankings for {category}: {str(e)}")
        # Return default rankings if validation fails
        default_rankings = {brand: i + 1 for i, brand in enumerate(brands)}
        return {"rankings": default_rankings, "reason": f"Default rankings due to validation error: {str(e)}"}

@app.post("/api/experiments/", response_model=ExperimentResponse)
async def create_experiment(request: ExperimentCreate, current_user: DBUser = Depends(get_user_from_token), db: Session = Depends(get_db)):
    print(f"🚀 Creating experiment for user: {current_user.username} (ID: {current_user.id})")
    print(f"🔍 Companies: {request.companies}")
    print(f"🔍 Categories: {request.categories}")
    
    llm = PerplexityService()
    results = {"rankings": {}, "average_ranks": {}}
    brand_scores = {brand: [] for brand in request.companies}
    
    for category in request.categories:
        try:
            print(f"🔍 Processing category: {category}")
            response = llm.get_rankings(request.companies, category)
            
            # Validate the response
            validated_response = validate_ranking(response, request.companies, category)
            
            # Store enhanced data including metadata
            category_data = {
                "rankings": validated_response["rankings"],
                "reason": validated_response.get("reason", ""),
                "metadata": response.get("metadata", {})
            }
            
            results["rankings"][category] = category_data
            
            print(f"✅ Rankings for {category}: {validated_response['rankings']}")
            
            # Calculate averages with case-insensitive matching
            for response_brand, rank in validated_response["rankings"].items():
                # Find the original brand name (case-insensitive match)
                original_brand = None
                for input_brand in request.companies:
                    if input_brand.lower() == response_brand.lower():
                        original_brand = input_brand
                        break
                
                if original_brand:
                    brand_scores[original_brand].append(rank)
                else:
                    print(f"⚠️ Warning: Could not match response brand '{response_brand}' to any input brand")
                
        except Exception as e:
            print(f"❌ Error processing category {category}: {str(e)}")
            print(f"❌ Error type: {type(e)}")
            import traceback
            print(f"❌ Full traceback: {traceback.format_exc()}")
            # Don't raise immediately, try to continue with other categories
            print(f"⚠️ Skipping category {category} due to error")
            continue
    
    # Compute average ranks
    for brand, scores in brand_scores.items():
        results["average_ranks"][brand] = sum(scores) / len(scores) if scores else 0.0
    
    # Create experiment in database
    db_experiment = Experiment(
        user_id=current_user.id,
        companies=request.companies,
        categories=request.categories,
        results=results["rankings"],
        average_ranks=results["average_ranks"]
    )
    
    db.add(db_experiment)
    db.commit()
    db.refresh(db_experiment)
    
    # Create response object
    experiment = ExperimentResult(
        id=db_experiment.id,
        companies=request.companies,
        categories=request.categories,
        results=results["rankings"],
        average_ranks=results["average_ranks"],
        created_at=db_experiment.created_at.isoformat()
    )
    
    print(f"✅ Experiment {db_experiment.id} stored in database successfully")
    
    return ExperimentResponse(
        experiment=experiment,
        message="Experiment created successfully"
    )

@app.get("/api/experiments/", response_model=List[ExperimentResult])
async def get_experiments(current_user: DBUser = Depends(get_user_from_token), db: Session = Depends(get_db)):
    # Get experiments from database for the current user
    print(f"🔍 Getting experiments for user: {current_user.username} (ID: {current_user.id})")
    
    db_experiments = db.query(Experiment).filter(Experiment.user_id == current_user.id).order_by(Experiment.created_at.desc()).all()
    print(f"🔍 Found {len(db_experiments)} experiments in database")
    
    user_experiments = []
    for db_exp in db_experiments:
        experiment = ExperimentResult(
            id=db_exp.id,
            companies=db_exp.companies,
            categories=db_exp.categories,
            results=db_exp.results,
            average_ranks=db_exp.average_ranks,
            created_at=db_exp.created_at.isoformat()
        )
        user_experiments.append(experiment)
        print(f"✅ Added experiment {db_exp.id} to user's list")
    
    print(f"✅ Returning {len(user_experiments)} experiments for user {current_user.username}")
    return user_experiments

@app.get("/api/experiments/{experiment_id}", response_model=ExperimentResult)
async def get_experiment(experiment_id: int, current_user: DBUser = Depends(get_user_from_token), db: Session = Depends(get_db)):
    # Get experiment from database
    db_experiment = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    
    if not db_experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    # Check if the experiment belongs to the current user
    if db_experiment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    experiment = ExperimentResult(
        id=db_experiment.id,
        companies=db_experiment.companies,
        categories=db_experiment.categories,
        results=db_experiment.results,
        average_ranks=db_experiment.average_ranks,
        created_at=db_experiment.created_at.isoformat()
    )
    
    return experiment

@app.post("/rank", response_model=RankingResult)
async def rank_brands(request: RankingRequest):
    llm = PerplexityService()
    results = {"rankings": {}, "average_ranks": {}}
    brand_scores = {brand: [] for brand in request.brands}

    for category in request.categories:
        try:
            response = llm.get_rankings(request.brands, category)
            results["rankings"][category] = response["rankings"]
            
            # Calculate averages with case-insensitive matching
            for response_brand, rank in response["rankings"].items():
                # Find the original brand name (case-insensitive match)
                original_brand = None
                for input_brand in request.brands:
                    if input_brand.lower() == response_brand.lower():
                        original_brand = input_brand
                        break
                
                if original_brand:
                    brand_scores[original_brand].append(rank)
                else:
                    print(f"⚠️ Warning: Could not match response brand '{response_brand}' to any input brand")
                
        except ValueError as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    # Compute average ranks
    for brand, scores in brand_scores.items():
        results["average_ranks"][brand] = sum(scores) / len(scores) if scores else 0.0
    
    return results

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/init-db")
async def init_database():
    """Initialize database tables manually"""
    try:
        Base.metadata.create_all(bind=engine)
        return {"message": "Database initialized successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database initialization failed: {str(e)}")

@app.get("/test-auth")
async def test_auth(current_user: DBUser = Depends(get_user_from_token)):
    return {"message": f"Authentication working for user: {current_user.username}"} 