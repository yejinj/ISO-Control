from fastapi import APIRouter, Request
from datetime import datetime
import requests

router = APIRouter()
event_log = []  # 장애 이력 저장소 (메모리)

@router.post("/alert")
async def receive_alert(request: Request):
    data = await request.json()
    print(f"[ALERT RECEIVED] {data}")
    data["time"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # 서버 기준 시간 추가
    event_log.append(data)  # 장애 이력 저장
    return {"status": "received"}
