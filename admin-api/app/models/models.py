from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class Event(BaseModel):
    timestamp: datetime
    event_type: str
    target: str
    reason: str
    status: str
