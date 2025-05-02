from fastapi import APIRouter

router = APIRouter()

@router.get("/events")
async def get_events():
    # 임시 mock 데이터
    return [
        {"id": 1, "type": "ProbeFail", "name": "core-xyz-123", "time": "10분 전"},
        {"id": 2, "type": "Isolated", "name": "worker-abc-456", "time": "15분 전"},
        {"id": 3, "type": "Recovered", "name": "db-main-789", "time": "30분 전"}
    ] 