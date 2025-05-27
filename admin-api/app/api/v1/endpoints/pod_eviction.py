from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from kubernetes import client, config
from app.api.v1.endpoints.alert import event_log

router = APIRouter()

class PodEvictRequest(BaseModel):
    namespace: str
    pod_name: str
    reason: str = ""

@router.post("/pod/evict")
async def evict_pod(req: PodEvictRequest):
    try:
        try:
            config.load_incluster_config()
        except:
            config.load_kube_config()
        v1 = client.CoreV1Api()
        v1.delete_namespaced_pod(name=req.pod_name, namespace=req.namespace)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pod eviction failed: {e}")
    # 이벤트 기록
    from datetime import datetime
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    event_log.append({
        "pod_name": req.pod_name,
        "namespace": req.namespace,
        "type": "eviction",
        "message": req.reason,
        "start_time": now,
        "recovery_time": None,
        "quarantine": False
    })
    return {"status": "evicted", "pod_name": req.pod_name, "namespace": req.namespace} 