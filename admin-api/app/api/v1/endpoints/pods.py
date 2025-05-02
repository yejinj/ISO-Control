from fastapi import APIRouter
from kubernetes import client, config
from typing import List

router = APIRouter()

@router.get("/pods")
async def get_pods():
    # 클러스터 내부에서 실행 시
    try:
        config.load_incluster_config()
    except:
        # 로컬 개발환경(쿠버네티스 외부)에서 실행 시
        config.load_kube_config()

    v1 = client.CoreV1Api()
    pods = v1.list_pod_for_all_namespaces(watch=False)

    result = []
    for pod in pods.items:
        # 실제 probe 상태는 pod.status.conditions에서 파싱 필요
        liveness = None
        readiness = None
        startup = None
        if pod.status.conditions:
            for cond in pod.status.conditions:
                if cond.type == "Ready":
                    readiness = (cond.status == "True")
                # Liveness/Startup은 annotation이나 별도 관리 필요 (k8s native에는 없음)
        result.append({
            "name": pod.metadata.name,
            "namespace": pod.metadata.namespace,
            "liveness": liveness,
            "readiness": readiness,
            "startup": startup,
            "status": pod.status.phase  # Running, Pending, Succeeded, Failed, Unknown
        })
    return result 