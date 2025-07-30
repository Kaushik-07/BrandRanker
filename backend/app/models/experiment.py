from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    companies = Column(JSON)  # List of company names
    categories = Column(JSON)  # List of category names
    results = Column(JSON)  # Detailed ranking results
    average_ranks = Column(JSON)  # Average ranks per company
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Enhanced metadata for analytics
    tags = Column(JSON, default=list)  # Tags for categorization
    llm_metadata = Column(JSON, default=dict)  # LLM model used, API calls, etc.
    performance_metrics = Column(JSON, default=dict)  # Timing, cache hits, etc.
    user_ip = Column(String(45), nullable=True)  # User IP for analytics
    user_agent = Column(Text, nullable=True)  # User agent for analytics
    
    # Relationships
    user = relationship("User", back_populates="experiments")


class ExperimentResult(Base):
    __tablename__ = "experiment_results"

    id = Column(Integer, primary_key=True, index=True)
    experiment_id = Column(Integer, ForeignKey("experiments.id"))
    category = Column(String)
    rankings = Column(JSON)  # Rankings for this category
    llm_response = Column(String)  # Raw LLM response
    created_at = Column(DateTime(timezone=True), server_default=func.now()) 