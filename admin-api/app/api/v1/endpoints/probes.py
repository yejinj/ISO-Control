from fastapi import APIRouter

router = APIRouter()

@router.get("/probes")
async def get_probes():
    # 임시 mock 데이터
    return {
        "liveness": {"fail_count": 2},
        "readiness": {"fail_count": 5}
    }

@router.get("/healthz")
async def healthz():
    return {"status": "healthy"}

@router.get("/ready")
async def ready():
    return {"status": "ready"} 