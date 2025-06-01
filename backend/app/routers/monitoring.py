#!/usr/bin/env python3
"""
모니터링 관련 API 라우터
"""

from fastapi import APIRouter, HTTPException
from typing import List
import subprocess
import json
from datetime import datetime

from app.models.schemas import (
    MonitoringResponse, ClusterStatus, MonitoringEvent
)

router = APIRouter()

# 모니터링 이벤트 저장소
monitoring_events: List[MonitoringEvent] = []

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
        
        # 노드별 파드 분포 계산
        node_pods = {}
        for pod in pods_data.get("items", []):
            node_name = pod["spec"].get("nodeName", "unknown")
            if node_name not in node_pods:
                node_pods[node_name] = {"total": 0, "ready": 0}
            
            node_pods[node_name]["total"] += 1
            if pod["status"].get("phase") == "Running":
                node_pods[node_name]["ready"] += 1
        
        # 클러스터 상태 구성
        return ClusterStatus(
            timestamp=datetime.utcnow().isoformat(),
            nodes=nodes_data.get("items", []),
            pod_distribution=[
                {
                    "node_name": node,
                    "total_pods": info["total"],
                    "ready_pods": info["ready"]
                }
                for node, info in node_pods.items()
            ],
            total_nodes=len(nodes_data.get("items", [])),
            ready_nodes=sum(1 for node in nodes_data.get("items", []) 
                          if any(cond["type"] == "Ready" and cond["status"] == "True" 
                                for cond in node["status"].get("conditions", []))),
            total_pods=sum(info["total"] for info in node_pods.values()),
            running_pods=sum(info["ready"] for info in node_pods.values())
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/monitoring/events", response_model=List[MonitoringEvent])
async def get_monitoring_events(limit: int = 50):
    """모니터링 이벤트 조회"""
    try:
        cmd = ["kubectl", "get", "events", "-o", "json", "--all-namespaces"]
        output = run_kubectl_command(cmd)
        data = json.loads(output)
        
        events = []
        for event in data.get("items", [])[:limit]:
            events.append(MonitoringEvent(
                id=event["metadata"]["uid"],
                type=event["type"],
                reason=event["reason"],
                message=event["message"],
                timestamp=event["lastTimestamp"],
                source=event.get("source", {}),
                involved_object=event.get("involvedObject", {})
            ))
        
        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=MonitoringResponse)
async def get_monitoring_data():
    """전체 모니터링 데이터 조회"""
    try:
        # 클러스터 상태 조회
        cluster_status = await get_cluster_status()
        
        # 최근 이벤트 조회
        events = await get_monitoring_events(limit=10)
        
        return MonitoringResponse(
            cluster_status=cluster_status,
            recent_events=events
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"모니터링 데이터 조회 실패: {str(e)}"
        )

def add_monitoring_event(event_type: str, message: str, **kwargs):
    """모니터링 이벤트 추가"""
    event = MonitoringEvent(
        timestamp=datetime.utcnow().isoformat(),
        type=event_type,
        message=message,
        **kwargs
    )
    monitoring_events.append(event)
    
    # 이벤트 개수 제한 (메모리 관리)
    if len(monitoring_events) > 1000:
        monitoring_events[:] = monitoring_events[-500:] 