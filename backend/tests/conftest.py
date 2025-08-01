import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.core.database import get_db, Base
from app.models.user import User
from app.services.auth_service import AuthService
import os

# Test database URL
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# Create test engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Create test session
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Auth service for testing
auth_service = AuthService()

@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test"""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database dependency override"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def test_user_data():
    """Test user data"""
    return {
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpassword123"
    }

@pytest.fixture
def test_user(db_session, test_user_data):
    """Create a test user in the database"""
    hashed_password = auth_service.get_password_hash(test_user_data["password"])
    user = User(
        email=test_user_data["email"],
        username=test_user_data["username"],
        hashed_password=hashed_password
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def auth_headers(client, test_user_data):
    """Get authentication headers for authenticated requests"""
    # Register user
    register_response = client.post("/api/auth/register", json=test_user_data)
    assert register_response.status_code == 200
    
    # Login to get token
    login_response = client.post("/api/auth/login", json={
        "username": test_user_data["username"],
        "password": test_user_data["password"]
    })
    assert login_response.status_code == 200
    
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def test_experiment_data():
    """Test experiment data"""
    return {
        "companies": ["Apple", "Samsung", "Google"],
        "categories": ["Smartphones", "Technology"]
    }

@pytest.fixture
def test_ranking_data():
    """Test ranking data"""
    return {
        "brands": ["Apple", "Samsung", "Google"],
        "categories": ["Smartphones", "Technology"]
    } 