from fastapi import Request
import time
from app.api.v1.endpoints.latency import record_latency

async def latency_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    latency_ms = (time.time() - start_time) * 1000
    
    # API 엔드포인트에만 지연 기록
    if request.url.path.startswith('/api/v1/'):
        await record_latency(latency_ms)
    
    return response 