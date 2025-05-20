from fastapi import APIRouter, HTTPException
from kubernetes import client, config
from typing import List
from datetime import datetime
from .alert import event_log  # event_log import
import asyncio
import random

router = APIRouter()

def parse_last_restart(container_status):
    # 마지막 재시작 시각 추출
    last_state = container_status.last_state
    if last_state and last_state.terminated and last_state.terminated.finished_at:
        return last_state.terminated.finished_at.strftime("%Y-%m-%dT%H:%M:%SZ")
    return None

@router.get("/pods")
async def get_pods():
    # 의도적인 지연 추가 (0.2 ~ 1초)
    await asyncio.sleep(random.uniform(0.2, 1.0))
    # 클러스터 내부에서 실행 시
    try:
        config.load_incluster_config()
    except:
        # 로컬 개발환경(쿠버네티스 외부)에서 실행 시
        config.load_kube_config()

    v1 = client.CoreV1Api()
    pods = v1.list_pod_for_all_namespaces(watch=False)

    result = []
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    for pod in pods.items:
        liveness = None
        readiness = None
        restart_count = 0
        last_restart = None
        container_states = []
        # 실제 컨테이너 상태 기반 liveness/readiness 판정
        if pod.status.container_statuses:
            for cs in pod.status.container_statuses:
                rc = cs.restart_count if hasattr(cs, 'restart_count') else 0
                restart_count = max(restart_count, rc)
                lr = parse_last_restart(cs)
                if lr and (last_restart is None or lr > last_restart):
                    last_restart = lr
                state = None
                if cs.state:
                    if cs.state.running:
                        state = "Running"
                        liveness = True
                    elif cs.state.waiting:
                        state = cs.state.waiting.reason
                        liveness = False
                    elif cs.state.terminated:
                        state = cs.state.terminated.reason
                        liveness = False
                container_states.append({
                    "name": cs.name,
                    "restartCount": rc,
                    "lastRestart": lr,
                    "state": state
                })
        if pod.status.conditions:
            for cond in pod.status.conditions:
                if cond.type == "Ready":
                    readiness = (cond.status == "True")
        # 복구 감지 및 event_log 업데이트
        if pod.status.phase == "Running":
            for event in reversed(event_log):
                if event["pod_name"] == pod.metadata.name and event["namespace"] == pod.metadata.namespace and event["recovery_time"] is None:
                    event["recovery_time"] = now
                    break
        result.append({
            "name": pod.metadata.name,
            "namespace": pod.metadata.namespace,
            "liveness": liveness,
            "readiness": readiness,
            "status": pod.status.phase,
            "restartCount": restart_count,
            "lastRestart": last_restart,
            "containerStates": container_states
        })
    return result 