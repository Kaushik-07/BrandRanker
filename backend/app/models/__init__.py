from sqlalchemy.orm import relationship
from ..core.database import Base
from .user import User
from .experiment import Experiment, ExperimentResult

# Add relationship
User.experiments = relationship("Experiment", back_populates="user")

__all__ = ["Base", "User", "Experiment", "ExperimentResult"] 