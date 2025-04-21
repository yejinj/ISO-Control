from fastapi import APIRouter
from app.database import events_collection
from app.models import Event
from typing import List

router = APIRouter()

@router.get("/events", response_model=List[Event])
def get_events():
    docs = events_collection.find().sort("timestamp", -1)
    return [Event(**doc) for doc in docs]
