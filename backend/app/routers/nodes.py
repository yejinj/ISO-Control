#!/usr/bin/env python3
"""
노드 관련 API 라우터
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List
import subprocess
import json
import logging

from app.models.schemas import (
    NodeListResponse, NodeInfo, NodeStatus,
    SuccessResponse, ErrorResponse
)

router = APIRouter()
logger = logging.getLogger(__name__)

def run_kubectl_command(command: List[str]) -> dict:
    """kubectl 명령 실행"""
    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            check=True
        )
        return {"success": True, "output": result.stdout, "error": None}
    except subprocess.CalledProcessError as e:
        return {"success": False, "output": None, "error": e.stderr}

def parse_node_info(node_data: dict) -> NodeInfo:
    """쿠버네티스 노드 데이터를 NodeInfo로 변환"""
    metadata = node_data.get("metadata", {})
    status = node_data.get("status", {})
    
    # 노드 상태 파싱
    conditions = status.get("conditions", [])
    node_status = NodeStatus.UNKNOWN
    for condition in conditions:
        if condition.get("type") == "Ready":
            if condition.get("status") == "True":
                node_status = NodeStatus.READY
            else:
                node_status = NodeStatus.NOT_READY
            break
    
    # 역할 파싱
    labels = metadata.get("labels", {})
    roles = []
    if "node-role.kubernetes.io/control-plane" in labels:
        roles.append("control-plane")
    if "node-role.kubernetes.io/master" in labels:
        roles.append("master")
    if "node-role.kubernetes.io/worker" in labels:
        roles.append("worker")
    if not roles:
        roles.append("worker")  # 기본값
    
    # IP 주소 파싱
    addresses = status.get("addresses", [])
    internal_ip = None
    external_ip = None
    for addr in addresses:
        if addr.get("type") == "InternalIP":
            internal_ip = addr.get("address")
        elif addr.get("type") == "ExternalIP":
            external_ip = addr.get("address")
    
    # 노드 정보 파싱
    node_info = status.get("nodeInfo", {})
    
    return NodeInfo(
        name=metadata.get("name", ""),
        status=node_status,
        roles=roles,
        age=metadata.get("creationTimestamp", ""),
        version=node_info.get("kubeletVersion", ""),
        internal_ip=internal_ip or "",
        external_ip=external_ip,
        os_image=node_info.get("osImage", ""),
        kernel_version=node_info.get("kernelVersion", ""),
        container_runtime=node_info.get("containerRuntimeVersion", "")
    )

@router.get("/", response_model=NodeListResponse)
async def get_nodes():
    """모든 노드 목록 조회"""
    try:
        # kubectl get nodes -o json 실행
        result = run_kubectl_command(["kubectl", "get", "nodes", "-o", "json"])
        
        if not result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"kubectl 명령 실행 실패: {result['error']}"
            )
        
        # JSON 파싱
        nodes_data = json.loads(result["output"])
        nodes = []
        
        for item in nodes_data.get("items", []):
            try:
                node_info = parse_node_info(item)
                nodes.append(node_info)
            except Exception as e:
                logger.warning(f"노드 정보 파싱 실패: {e}")
                continue
        
        return NodeListResponse(
            nodes=nodes,
            total_count=len(nodes)
        )
        
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"JSON 파싱 실패: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"노드 목록 조회 실패: {str(e)}"
        )

@router.get("/{node_name}", response_model=NodeInfo)
async def get_node(node_name: str):
    """특정 노드 정보 조회"""
    try:
        # kubectl get node <node_name> -o json 실행
        result = run_kubectl_command([
            "kubectl", "get", "node", node_name, "-o", "json"
        ])
        
        if not result["success"]:
            if "not found" in result["error"].lower():
                raise HTTPException(
                    status_code=404,
                    detail=f"노드를 찾을 수 없습니다: {node_name}"
                )
            raise HTTPException(
                status_code=500,
                detail=f"kubectl 명령 실행 실패: {result['error']}"
            )
        
        # JSON 파싱
        node_data = json.loads(result["output"])
        node_info = parse_node_info(node_data)
        
        return node_info
        
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"JSON 파싱 실패: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"노드 정보 조회 실패: {str(e)}"
        )

@router.post("/{node_name}/cordon", response_model=SuccessResponse)
async def cordon_node(node_name: str):
    """노드 스케줄링 비활성화 (cordon)"""
    try:
        result = run_kubectl_command(["kubectl", "cordon", node_name])
        
        if not result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"노드 cordon 실패: {result['error']}"
            )
        
        return SuccessResponse(
            message=f"노드 {node_name}이 성공적으로 cordon되었습니다."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"노드 cordon 실패: {str(e)}"
        )

@router.post("/{node_name}/uncordon", response_model=SuccessResponse)
async def uncordon_node(node_name: str):
    """노드 스케줄링 활성화 (uncordon)"""
    try:
        result = run_kubectl_command(["kubectl", "uncordon", node_name])
        
        if not result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"노드 uncordon 실패: {result['error']}"
            )
        
        return SuccessResponse(
            message=f"노드 {node_name}이 성공적으로 uncordon되었습니다."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"노드 uncordon 실패: {str(e)}"
        )

@router.post("/{node_name}/drain", response_model=SuccessResponse)
async def drain_node(node_name: str):
    """노드 드레인 (파드 제거)"""
    try:
        result = run_kubectl_command([
            "kubectl", "drain", node_name,
            "--ignore-daemonsets",
            "--delete-emptydir-data",
            "--force"
        ])
        
        if not result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"노드 drain 실패: {result['error']}"
            )
        
        return SuccessResponse(
            message=f"노드 {node_name}이 성공적으로 drain되었습니다."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"노드 drain 실패: {str(e)}"
        ) 