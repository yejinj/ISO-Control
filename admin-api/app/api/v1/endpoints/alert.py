from fastapi import APIRouter, Request

router = APIRouter()

@router.post("/alert")
async def receive_alert(request: Request):
    data = await request.json()
    print(f"[ALERT RECEIVED] {data}")
    return {"status": "received"}
