from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class Event(BaseModel):
    timestamp: datetime
    event_type: str  # e.g., "isolate", "restart"
    target: str      # Pod or Service name
    reason: Optional[str]
    status: str      # e.g., "completed", "pending"
