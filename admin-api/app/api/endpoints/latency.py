from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
import time

router = APIRouter()

# 메모리에 최근 100개의 지연 데이터 저장
latency_history = []

@router.get("/latency")
async def get_latency_history():
    return latency_history

@router.post("/latency")
async def record_latency(latency_ms: float):
    timestamp = datetime.now().isoformat()
    latency_history.append({
        "timestamp": timestamp,
        "latency_ms": latency_ms
    })
    # 최대 100개만 유지
    if len(latency_history) > 100:
        latency_history.pop(0)
    return {"status": "success"} 