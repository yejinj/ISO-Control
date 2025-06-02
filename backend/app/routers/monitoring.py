#!/usr/bin/env python3
"""
모니터링 관련 API 라우터
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List
import subprocess
import json
from datetime import datetime

from app.models.schemas import (
    MonitoringResponse, ClusterStatus, MonitoringEvent,
    Node, PodDistribution
)
from app.stores.event_store import event_store

router = APIRouter()

def run_kubectl_command(command: List[str]) -> str:
    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"kubectl 명령 실행 실패: {e.stderr}")

async def fetch_events():
    """이벤트 데이터 가져오기"""
    try:
        cmd = ["kubectl", "get", "events", "-o", "json", "--all-namespaces"]
        output = run_kubectl_command(cmd)
        data = json.loads(output)
        
        events = []
        for event in data.get("items", []):
            metadata = event.get("metadata", {})
            involved_object = event.get("involvedObject", {})
            source = event.get("source", {})
            
            events.append(MonitoringEvent(
                id=metadata.get("uid", metadata.get("name", "")),
                type=event.get("type", "Normal"),
                reason=event.get("reason", ""),
                message=event.get("message", ""),
                timestamp=event.get("lastTimestamp", event.get("firstTimestamp", datetime.utcnow().isoformat())),
                source={
                    "component": source.get("component", ""),
                    "host": source.get("host")
                },
                involved_object={
                    "kind": involved_object.get("kind", ""),
                    "name": involved_object.get("name", ""),
                    "namespace": involved_object.get("namespace", "")
                }
            ))
        
        event_store.update_events(events)
    except Exception as e:
        print(f"이벤트 가져오기 실패: {str(e)}")

@router.get("/monitoring/cluster", response_model=ClusterStatus)
async def get_cluster_status():
    """클러스터 상태 조회"""
    try:
        # 노드 정보 조회
        nodes_cmd = ["kubectl", "get", "nodes", "-o", "json"]
        nodes_output = run_kubectl_command(nodes_cmd)
        nodes_data = json.loads(nodes_output)
        
        # 파드 정보 조회
        pods_cmd = ["kubectl", "get", "pods", "-o", "json", "--all-namespaces"]
        pods_output = run_kubectl_command(pods_cmd)
        pods_data = json.loads(pods_output)
        
        # 노드 정보 파싱
        nodes = []
        for item in nodes_data.get("items", []):
            metadata = item.get("metadata", {})
            status = item.get("status", {})
            spec = item.get("spec", {})
            
            # 노드 상태 파싱
            conditions = status.get("conditions", [])
            ready_condition = next(
                (c for c in conditions if c.get("type") == "Ready"),
                {"status": "Unknown"}
            )
            
            # 노드 정보 구성
            node = Node(
                name=metadata.get("name", ""),
                status=ready_condition.get("status", "Unknown"),
                roles=[metadata.get("labels", {}).get("kubernetes.io/role", "worker")],
                age=metadata.get("creationTimestamp", ""),
                version=status.get("nodeInfo", {}).get("kubeletVersion", ""),
                internal_ip=next(
                    (addr["address"] for addr in status.get("addresses", [])
                     if addr["type"] == "InternalIP"),
                    ""
                ),
                external_ip=next(
                    (addr["address"] for addr in status.get("addresses", [])
                     if addr["type"] == "ExternalIP"),
                    ""
                ),
                os=status.get("nodeInfo", {}).get("os", ""),
                kernel=status.get("nodeInfo", {}).get("kernelVersion", ""),
                container_runtime=status.get("nodeInfo", {}).get("containerRuntimeVersion", ""),
                architecture=status.get("nodeInfo", {}).get("architecture", ""),
                cpu=status.get("capacity", {}).get("cpu", "0"),
                memory=status.get("capacity", {}).get("memory", "0"),
                pods=status.get("capacity", {}).get("pods", "0"),
                unschedulable=spec.get("unschedulable", False)
            )
            nodes.append(node)
        
        # 노드별 파드 분포 계산
        node_pods = {}
        for pod in pods_data.get("items", []):
            node_name = pod["spec"].get("nodeName", "unknown")
            if node_name not in node_pods:
                node_pods[node_name] = {"total": 0, "ready": 0}
            
            node_pods[node_name]["total"] += 1
            if pod["status"].get("phase") == "Running":
                node_pods[node_name]["ready"] += 1
        
        # 파드 분포 정보 구성
        pod_distribution = [
            PodDistribution(
                node_name=node,
                pod_count=info["total"],
                ready_count=info["ready"],
                pods=[]  # 필요한 경우 파드 상세 정보 추가
            )
            for node, info in node_pods.items()
        ]
        
        # 클러스터 상태 구성
        return ClusterStatus(
            timestamp=datetime.utcnow(),
            nodes=nodes,
            pod_distribution=pod_distribution,
            total_nodes=len(nodes),
            ready_nodes=sum(1 for node in nodes if node.status == "True"),
            total_pods=sum(info["total"] for info in node_pods.values()),
            running_pods=sum(info["ready"] for info in node_pods.values())
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/monitoring/events", response_model=List[MonitoringEvent])
async def get_monitoring_events(background_tasks: BackgroundTasks, limit: int = 50):
    """모니터링 이벤트 조회"""
    if event_store.should_update():
        background_tasks.add_task(fetch_events)
    return event_store.get_events(limit)

@router.get("/", response_model=MonitoringResponse)
async def get_monitoring_data(background_tasks: BackgroundTasks):
    """전체 모니터링 데이터 조회"""
    try:
        # 클러스터 상태 조회
        cluster_status = await get_cluster_status()
        
        # 이벤트 업데이트 필요시 백그라운드에서 실행
        if event_store.should_update():
            background_tasks.add_task(fetch_events)
        
        return MonitoringResponse(
            cluster_status=cluster_status,
            recent_events=event_store.get_events(limit=10)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 