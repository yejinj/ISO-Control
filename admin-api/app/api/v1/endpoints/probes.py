from fastapi import APIRouter

router = APIRouter()

@router.get("/probes")
async def get_probes():
    # 임시 mock 데이터
    return {
        "liveness": {"fail_count": 2},
        "readiness": {"fail_count": 5},
        "startup": {"fail_count": 0}
    } 