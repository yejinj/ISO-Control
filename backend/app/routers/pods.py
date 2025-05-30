from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from kubernetes import client, config
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/pods/integrated")
async def get_integrated_pod_data():
    """
    파드 관련 모든 데이터를 통합하여 반환하는 API
    - 파드 분포
    - 파드 상태
    - 파드 이벤트
    """
    try:
        # Kubernetes 클라이언트 초기화
        config.load_incluster_config()
        v1 = client.CoreV1Api()
        events_api = client.EventsV1Api()

        # 1. 파드 분포 데이터 수집
        nodes = v1.list_node()
        pod_distribution = []
        
        for node in nodes.items:
            node_name = node.metadata.name
            pods = v1.list_pod_for_all_namespaces(field_selector=f"spec.nodeName={node_name}")
            
            pod_count = len(pods.items)
            ready_count = sum(1 for pod in pods.items if pod.status.phase == "Running")
            
            pod_list = []
            for pod in pods.items:
                pod_list.append({
                    "name": pod.metadata.name,
                    "namespace": pod.metadata.namespace,
                    "status": pod.status.phase,
                    "restarts": sum(container.restart_count for container in pod.status.container_statuses or [])
                })
            
            pod_distribution.append({
                "node_name": node_name,
                "pod_count": pod_count,
                "ready_count": ready_count,
                "pods": pod_list
            })

        # 2. 파드 이벤트 수집 (최근 1시간)
        events = events_api.list_event_for_all_namespaces(
            field_selector="involvedObject.kind=Pod",
            limit=50
        )
        
        pod_events = []
        for event in events.items:
            pod_events.append({
                "id": event.metadata.uid,
                "type": event.type,
                "reason": event.reason,
                "message": event.note,
                "timestamp": event.event_time.isoformat(),
                "source": {
                    "component": event.source.component,
                    "host": event.source.host
                },
                "involved_object": {
                    "kind": event.regarding.kind,
                    "name": event.regarding.name,
                    "namespace": event.regarding.namespace
                }
            })

        # 3. 통합 데이터 반환
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "pod_distribution": pod_distribution,
            "events": pod_events,
            "summary": {
                "total_pods": sum(dist["pod_count"] for dist in pod_distribution),
                "running_pods": sum(dist["ready_count"] for dist in pod_distribution),
                "total_nodes": len(pod_distribution),
                "active_nodes": sum(1 for dist in pod_distribution if dist["pod_count"] > 0)
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 