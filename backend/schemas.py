from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ReportBase(BaseModel):
    image_source: str
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ReportCreate(ReportBase):
    is_emergency: Optional[bool] = False
    sos_type: Optional[str] = None

class ReportResponse(ReportBase):
    id: int
    image_path: str
    damage_detected: bool
    damage_types: List[str]
    severity: str
    confidence: float
    priority_score: int
    suggested_actions: List[str] = []
    suggested_supplies: List[str] = []
    required_resources: List[str] = []
    is_emergency: bool = False
    sos_type: Optional[str] = None
    summary: Optional[str] = None
    timestamp: datetime

    class Config:
        orm_mode = True
