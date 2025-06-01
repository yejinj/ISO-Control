#!/usr/bin/env python3
"""
노드 관련 API 라우터
"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional
import subprocess
import json
import logging

from app.models.schemas import Node, NodeList

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

@router.get("/nodes", response_model=NodeList)
async def get_nodes():
    """노드 목록 조회"""
    try:
        cmd = ["kubectl", "get", "nodes", "-o", "json"]
        output = run_kubectl_command(cmd)
        data = json.loads(output)
        
        nodes = []
        for item in data.get("items", []):
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
                roles=metadata.get("labels", {}).get("kubernetes.io/role", "worker"),
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
        
        return NodeList(nodes=nodes)
    except Exception as e:
        logger.error(f"노드 목록 조회 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/nodes/{node_name}/cordon")
async def cordon_node(node_name: str):
    """노드 cordon"""
    try:
        cmd = ["kubectl", "cordon", node_name]
        run_kubectl_command(cmd)
        return {"message": f"Node {node_name} has been cordoned"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/nodes/{node_name}/uncordon")
async def uncordon_node(node_name: str):
    """노드 uncordon"""
    try:
        cmd = ["kubectl", "uncordon", node_name]
        run_kubectl_command(cmd)
        return {"message": f"Node {node_name} has been uncordoned"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/nodes/{node_name}/drain")
async def drain_node(node_name: str):
    """노드 drain"""
    try:
        cmd = ["kubectl", "drain", node_name, "--ignore-daemonsets", "--delete-emptydir-data"]
        run_kubectl_command(cmd)
        return {"message": f"Node {node_name} has been drained"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 