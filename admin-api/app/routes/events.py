from fastapi import APIRouter
from typing import List
from datetime import datetime
from app.models import Event
from app.database import events_data

router = APIRouter()

@router.get("/events", response_model=List[Event])
def get_events():
    return events_data

@router.get("/test")
def test_endpoint():
    return {"message": "API is working!"}

@router.post("/test-data")
def add_test_data():
    test_event = Event(
        timestamp=datetime.now(),
        event_type="test",
        target="test-pod",
        reason="testing",
        status="completed"
    )
    events_data.append(test_event)
    return {"message": "Test data added", "count": len(events_data)}
