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

def get_pod_status(pod):
    liveness = None
    readiness = None
    if pod.status.container_statuses:
        for cs in pod.status.container_statuses:
            if cs.state and cs.state.running:
                liveness = True
            elif cs.state and (cs.state.waiting or cs.state.terminated):
                liveness = False
    if pod.status.conditions:
        for cond in pod.status.conditions:
            if cond.type == "Ready":
                readiness = (cond.status == "True")
    return {
        "liveness": liveness,
        "readiness": readiness
    } 