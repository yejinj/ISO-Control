from fastapi import APIRouter
from .alert import event_log  # alert.py의 event_log를 import

router = APIRouter()

@router.get("/events")
async def get_events():
    return event_log[-100:]  # 최근 100개만 반환 