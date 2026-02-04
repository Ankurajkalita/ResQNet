from sqlalchemy import Column, Integer, String, Float, Boolean, JSON, DateTime
from database import Base
from datetime import datetime

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    image_path = Column(String)
    image_source = Column(String)
    location_name = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    damage_detected = Column(Boolean, default=False)
    damage_types = Column(JSON) # Storing list as JSON
    severity = Column(String) # Low, Medium, Critical
    confidence = Column(Float)
    priority_score = Column(Integer) # 1-100
    
    suggested_actions = Column(JSON) # List of strings
    suggested_supplies = Column(JSON) # List of strings e.g. "Food 50kg"
    required_resources = Column(JSON) # List of strings
    
    is_emergency = Column(Boolean, default=False)
    sos_type = Column(String, nullable=True) # "life_threat", "medical", "standard"
    summary = Column(String, nullable=True)
    
    timestamp = Column(DateTime, default=datetime.utcnow)
