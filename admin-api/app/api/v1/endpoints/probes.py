from fastapi import APIRouter
import psutil

router = APIRouter()

@router.get("/probes")
async def get_probes():
    cpu = psutil.cpu_percent(interval=1)
    mem = psutil.virtual_memory().percent
    # 소수점 한 자리로 제한, None이면 0 반환
    cpu = round(cpu, 1) if cpu is not None else 0
    mem = round(mem, 1) if mem is not None else 0
    return {
        "liveness": {"fail_count": 2},
        "readiness": {"fail_count": 5},
        "cpuUsage": cpu,
        "memoryUsage": mem
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