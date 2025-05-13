from fastapi import APIRouter, Request
from datetime import datetime
import requests
from kubernetes import client, config

router = APIRouter()
event_log = []
pod_fail_count = {}

def restart_pod(namespace, pod_name):
    try:
        config.load_incluster_config()
    except:
        config.load_kube_config()
    v1 = client.CoreV1Api()
    v1.delete_namespaced_pod(name=pod_name, namespace=namespace)
    print(f"[OPERATOR] Pod {pod_name} in {namespace} deleted for restart.")

def move_to_quarantine(namespace, pod_name):
    try:
        config.load_incluster_config()
    except:
        config.load_kube_config()
    v1 = client.CoreV1Api()
    pod = v1.read_namespaced_pod(name=pod_name, namespace=namespace)
    pod.metadata.namespace = "quarantine-namespace"
    pod.metadata.resource_version = None
    v1.create_namespaced_pod(namespace="quarantine-namespace", body=pod)
    v1.delete_namespaced_pod(name=pod_name, namespace=namespace)
    print(f"[OPERATOR] Pod {pod_name} moved to quarantine-namespace.")

@router.post("/alert")
async def receive_alert(request: Request):
    data = await request.json()
    print(f"[ALERT RECEIVED] {data}")
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    data["time"] = now  # 서버 기준 시간 추가
    pod_name = data.get("pod_name")
    namespace = data.get("namespace", "isocontrol-prod")
    # 이전 장애 이벤트가 recovery_time 없이 남아있으면 복구 처리
    for event in reversed(event_log):
        if event["pod_name"] == pod_name and event["namespace"] == namespace and event["recovery_time"] is None:
            event["recovery_time"] = now
            break
    event_log.append({
        "pod_name": pod_name,
        "namespace": namespace,
        "type": "alert",
        "message": data.get("message"),
        "start_time": now,
        "recovery_time": None,
        "quarantine": False
    })
    key = f"{namespace}:{pod_name}"
    if pod_name:
        pod_fail_count[key] = pod_fail_count.get(key, 0) + 1
        # 3회 미만: 재시작, 3회 이상: 격리
        if pod_fail_count[key] < 3:
            restart_pod(namespace, pod_name)
        else:
            move_to_quarantine(namespace, pod_name)
            pod_fail_count[key] = 0  # 격리 후 카운트 초기화
            event_log[-1]["quarantine"] = True
    return {"status": "received"}
