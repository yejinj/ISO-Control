from fastapi import APIRouter
from typing import List
from datetime import datetime
from app.models import Event
from app.database.database import get_events

router = APIRouter()

@router.get("/events")
async def fetch_events():
    events = get_events()
    print("API /events called. Returning:", events)  # 디버깅용 출력
    return {"events": events}
