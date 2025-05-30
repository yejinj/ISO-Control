#!/usr/bin/env python3
"""
파드 관련 API 라우터
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from kubernetes import client, config
from datetime import datetime
import subprocess
import json
import logging

from app.models.schemas import (
    PodListResponse, PodInfo, PodStatus, PodDistributionResponse, PodDistribution, IntegratedPodData
)

router = APIRouter()
logger = logging.getLogger(__name__)

def run_kubectl_command(command: List[str]) -> str:
    """kubectl 명령 실행"""
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

def parse_pod_info(pod_data: dict) -> PodInfo:
    """쿠버네티스 파드 데이터를 PodInfo로 변환"""
    metadata = pod_data.get("metadata", {})
    status = pod_data.get("status", {})
    spec = pod_data.get("spec", {})
    
    # 파드 상태 파싱
    phase = status.get("phase", "Unknown")
    pod_status = PodStatus.UNKNOWN
    if phase == "Running":
        pod_status = PodStatus.RUNNING
    elif phase == "Pending":
        pod_status = PodStatus.PENDING
    elif phase == "Succeeded":
        pod_status = PodStatus.SUCCEEDED
    elif phase == "Failed":
        pod_status = PodStatus.FAILED
    
    # Ready 상태 파싱
    conditions = status.get("conditions", [])
    ready_count = 0
    total_count = len(spec.get("containers", []))
    
    for condition in conditions:
        if condition.get("type") == "Ready" and condition.get("status") == "True":
            ready_count = total_count
            break
    
    ready_str = f"{ready_count}/{total_count}"
    
    # 재시작 횟수 파싱
    restarts = 0
    container_statuses = status.get("containerStatuses", [])
    for container_status in container_statuses:
        restarts += container_status.get("restartCount", 0)
    
    return PodInfo(
        name=metadata.get("name", ""),
        namespace=metadata.get("namespace", "default"),
        status=pod_status,
        ready=ready_str,
        restarts=restarts,
        age=metadata.get("creationTimestamp", ""),
        ip=status.get("podIP"),
        node=spec.get("nodeName", ""),
        nominated_node=status.get("nominatedNodeName"),
        readiness_gates=None
    )

@router.get("/pods", response_model=List[dict])
async def get_pods(namespace: Optional[str] = None):
    """파드 목록 조회"""
    try:
        cmd = ["kubectl", "get", "pods", "-o", "json"]
        if namespace:
            cmd.extend(["-n", namespace])
        
        output = run_kubectl_command(cmd)
        data = json.loads(output)
        return data.get("items", [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pods/distribution", response_model=PodDistributionResponse)
async def get_pod_distribution():
    """파드 분포 정보 조회"""
    try:
        # 노드별 파드 수 조회
        cmd = ["kubectl", "get", "pods", "-o", "json", "--all-namespaces"]
        output = run_kubectl_command(cmd)
        data = json.loads(output)
        
        # 노드별 파드 수 계산
        node_pods = {}
        for pod in data.get("items", []):
            node_name = pod["spec"].get("nodeName", "unknown")
            if node_name not in node_pods:
                node_pods[node_name] = {"total": 0, "ready": 0}
            
            node_pods[node_name]["total"] += 1
            if pod["status"].get("phase") == "Running":
                node_pods[node_name]["ready"] += 1
        
        # 응답 형식으로 변환
        distributions = [
            PodDistribution(
                node_name=node,
                total_pods=info["total"],
                ready_pods=info["ready"]
            )
            for node, info in node_pods.items()
        ]
        
        return PodDistributionResponse(distributions=distributions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pods/integrated", response_model=IntegratedPodData)
async def get_integrated_pod_data():
    """통합 파드 데이터 조회"""
    try:
        # 파드 목록 조회
        pods_cmd = ["kubectl", "get", "pods", "-o", "json", "--all-namespaces"]
        pods_output = run_kubectl_command(pods_cmd)
        pods_data = json.loads(pods_output)
        
        # 파드 이벤트 조회
        events_cmd = ["kubectl", "get", "events", "-o", "json", "--all-namespaces"]
        events_output = run_kubectl_command(events_cmd)
        events_data = json.loads(events_output)
        
        # 노드별 파드 분포 계산
        node_pods = {}
        for pod in pods_data.get("items", []):
            node_name = pod["spec"].get("nodeName", "unknown")
            if node_name not in node_pods:
                node_pods[node_name] = {"total": 0, "ready": 0}
            
            node_pods[node_name]["total"] += 1
            if pod["status"].get("phase") == "Running":
                node_pods[node_name]["ready"] += 1
        
        # 응답 데이터 구성
        return IntegratedPodData(
            distribution=[
                PodDistribution(
                    node_name=node,
                    total_pods=info["total"],
                    ready_pods=info["ready"]
                )
                for node, info in node_pods.items()
            ],
            pods=pods_data.get("items", []),
            events=events_data.get("items", [])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
