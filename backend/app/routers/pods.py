#!/usr/bin/env python3
"""
파드 관련 API 라우터
"""

from fastapi import APIRouter, HTTPException
import subprocess
import json
import logging
from typing import Optional

from app.models.schemas import (
    PodListResponse, PodInfo, PodStatus, PodDistributionResponse, PodDistribution
)

router = APIRouter()
logger = logging.getLogger(__name__)

def run_kubectl_command(command):
    """kubectl 명령 실행"""
    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        return {"success": True, "output": result.stdout, "error": None}
    except subprocess.CalledProcessError as e:
        return {"success": False, "output": None, "error": e.stderr}

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

@router.get("/", response_model=PodListResponse)
async def get_pods(namespace: Optional[str] = None):
    """파드 목록 조회"""
    try:
        command = ["kubectl", "get", "pods", "-o", "json"]
        if namespace:
            command.extend(["-n", namespace])
        else:
            command.append("--all-namespaces")
        
        result = run_kubectl_command(command)
        
        if not result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"kubectl 명령 실행 실패: {result['error']}"
            )
        
        pods_data = json.loads(result["output"])
        pods = []
        
        for item in pods_data.get("items", []):
            try:
                pod_info = parse_pod_info(item)
                pods.append(pod_info)
            except Exception as e:
                logger.warning(f"파드 정보 파싱 실패: {e}")
                continue
        
        return PodListResponse(
            pods=pods,
            total_count=len(pods)
        )
        
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"JSON 파싱 실패: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"파드 목록 조회 실패: {str(e)}"
        )

@router.get("/distribution", response_model=PodDistributionResponse)
async def get_pod_distribution():
    """노드별 파드 분포 조회"""
    try:
        # 모든 파드 조회
        pods_response = await get_pods()
        pods = pods_response.pods
        
        # 노드별로 그룹화
        node_pods = {}
        for pod in pods:
            node_name = pod.node or "Unscheduled"
            if node_name not in node_pods:
                node_pods[node_name] = []
            node_pods[node_name].append(pod)
        
        # 분포 정보 생성
        distributions = []
        for node_name, node_pod_list in node_pods.items():
            ready_count = sum(1 for pod in node_pod_list if pod.status == PodStatus.RUNNING)
            
            distribution = PodDistribution(
                node_name=node_name,
                pod_count=len(node_pod_list),
                ready_count=ready_count,
                pods=node_pod_list
            )
            distributions.append(distribution)
        
        return PodDistributionResponse(
            distributions=distributions,
            total_pods=len(pods)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"파드 분포 조회 실패: {str(e)}"
        ) 