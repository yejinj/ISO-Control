#!/usr/bin/env python3
"""
파드 관련 API 라우터
"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional
import subprocess
import json
import logging
from datetime import datetime

from app.models.schemas import (
    PodInfo, PodListResponse, PodDistribution,
    PodDistributionResponse, IntegratedPodData,
    MonitoringEvent
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

@router.get("/pods", response_model=PodListResponse)
async def get_pods():
    """파드 목록 조회"""
    try:
        cmd = ["kubectl", "get", "pods", "-o", "json", "--all-namespaces"]
        output = run_kubectl_command(cmd)
        data = json.loads(output)
        
        pods = []
        for item in data.get("items", []):
            metadata = item.get("metadata", {})
            spec = item.get("spec", {})
            status = item.get("status", {})
            
            # 컨테이너 상태 파싱
            container_statuses = status.get("containerStatuses", [])
            ready_count = sum(1 for cs in container_statuses if cs.get("ready", False))
            total_count = len(container_statuses)
            ready = f"{ready_count}/{total_count}" if total_count > 0 else "0/0"
            
            # 재시작 횟수 계산
            restarts = sum(cs.get("restartCount", 0) for cs in container_statuses)
            
            pod = PodInfo(
                name=metadata.get("name", ""),
                namespace=metadata.get("namespace", ""),
                status=status.get("phase", "Unknown"),
                ready=ready,
                restarts=restarts,
                age=metadata.get("creationTimestamp", ""),
                ip=status.get("podIP"),
                node=spec.get("nodeName", ""),
                nominated_node=status.get("nominatedNodeName"),
                readiness_gates=",".join(gate.get("conditionType", "") for gate in spec.get("readinessGates", []))
            )
            pods.append(pod)
        
        return PodListResponse(pods=pods, total_count=len(pods))
    except Exception as e:
        logger.error(f"파드 목록 조회 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pods/distribution", response_model=PodDistributionResponse)
async def get_pod_distribution():
    """파드 분포 조회"""
    try:
        cmd = ["kubectl", "get", "pods", "-o", "json", "--all-namespaces"]
        output = run_kubectl_command(cmd)
        data = json.loads(output)
        
        # 노드별 파드 분포 계산
        node_pods = {}
        for item in data.get("items", []):
            node_name = item["spec"].get("nodeName", "unknown")
            if node_name not in node_pods:
                node_pods[node_name] = {
                    "pod_count": 0,
                    "ready_count": 0,
                    "pods": []
                }
            
            # 파드 정보 파싱
            metadata = item.get("metadata", {})
            spec = item.get("spec", {})
            status = item.get("status", {})
            
            # 컨테이너 상태 파싱
            container_statuses = status.get("containerStatuses", [])
            ready_count = sum(1 for cs in container_statuses if cs.get("ready", False))
            total_count = len(container_statuses)
            ready = f"{ready_count}/{total_count}" if total_count > 0 else "0/0"
            
            # 재시작 횟수 계산
            restarts = sum(cs.get("restartCount", 0) for cs in container_statuses)
            
            pod = PodInfo(
                name=metadata.get("name", ""),
                namespace=metadata.get("namespace", ""),
                status=status.get("phase", "Unknown"),
                ready=ready,
                restarts=restarts,
                age=metadata.get("creationTimestamp", ""),
                ip=status.get("podIP"),
                node=node_name,
                nominated_node=status.get("nominatedNodeName"),
                readiness_gates=",".join(gate.get("conditionType", "") for gate in spec.get("readinessGates", []))
            )
            
            node_pods[node_name]["pods"].append(pod)
            node_pods[node_name]["pod_count"] += 1
            if status.get("phase") == "Running":
                node_pods[node_name]["ready_count"] += 1
        
        # 분포 정보 구성
        distributions = [
            PodDistribution(
                node_name=node,
                pod_count=info["pod_count"],
                ready_count=info["ready_count"],
                pods=info["pods"]
            )
            for node, info in node_pods.items()
        ]
        
        return PodDistributionResponse(
            distributions=distributions,
            total_pods=sum(info["pod_count"] for info in node_pods.values())
        )
    except Exception as e:
        logger.error(f"파드 분포 조회 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pods/integrated", response_model=IntegratedPodData)
async def get_integrated_pod_data():
    """통합 파드 데이터 조회"""
    try:
        # 파드 정보 조회
        pods_cmd = ["kubectl", "get", "pods", "-o", "json", "--all-namespaces"]
        pods_output = run_kubectl_command(pods_cmd)
        pods_data = json.loads(pods_output)
        
        # 이벤트 정보 조회
        events_cmd = ["kubectl", "get", "events", "-o", "json", "--all-namespaces"]
        events_output = run_kubectl_command(events_cmd)
        events_data = json.loads(events_output)
        
        # 노드별 파드 분포 계산
        node_pods = {}
        total_pods = 0
        running_pods = 0
        active_nodes = set()
        
        for item in pods_data.get("items", []):
            node_name = item["spec"].get("nodeName", "unknown")
            if node_name not in node_pods:
                node_pods[node_name] = {
                    "pod_count": 0,
                    "ready_count": 0,
                    "pods": []
                }
            
            # 파드 정보 파싱
            metadata = item.get("metadata", {})
            spec = item.get("spec", {})
            status = item.get("status", {})
            
            # 컨테이너 상태 파싱
            container_statuses = status.get("containerStatuses", [])
            ready_count = sum(1 for cs in container_statuses if cs.get("ready", False))
            total_count = len(container_statuses)
            ready = f"{ready_count}/{total_count}" if total_count > 0 else "0/0"
            
            # 재시작 횟수 계산
            restarts = sum(cs.get("restartCount", 0) for cs in container_statuses)
            
            pod = PodInfo(
                name=metadata.get("name", ""),
                namespace=metadata.get("namespace", ""),
                status=status.get("phase", "Unknown"),
                ready=ready,
                restarts=restarts,
                age=metadata.get("creationTimestamp", ""),
                ip=status.get("podIP"),
                node=node_name,
                nominated_node=status.get("nominatedNodeName"),
                readiness_gates=",".join(gate.get("conditionType", "") for gate in spec.get("readinessGates", []))
            )
            
            node_pods[node_name]["pods"].append(pod)
            node_pods[node_name]["pod_count"] += 1
            if status.get("phase") == "Running":
                node_pods[node_name]["ready_count"] += 1
                running_pods += 1
                active_nodes.add(node_name)
            total_pods += 1
        
        # 파드 분포 리스트 생성
        pod_distribution = [
            PodDistribution(
                node_name=node_name,
                pod_count=data["pod_count"],
                ready_count=data["ready_count"],
                pods=data["pods"]
            )
            for node_name, data in node_pods.items()
        ]
        
        # 이벤트 정보 파싱
        events = []
        for event in events_data.get("items", []):
            events.append(MonitoringEvent(
                id=event.get("metadata", {}).get("uid", ""),
                type=event.get("type", "Normal"),
                reason=event.get("reason", ""),
                message=event.get("message", ""),
                timestamp=event.get("lastTimestamp", datetime.now().isoformat()),
                source={
                    "component": event.get("source", {}).get("component", ""),
                    "host": event.get("source", {}).get("host")
                },
                involved_object={
                    "kind": event.get("involvedObject", {}).get("kind", ""),
                    "name": event.get("involvedObject", {}).get("name", ""),
                    "namespace": event.get("involvedObject", {}).get("namespace", "")
                }
            ))
        
        return IntegratedPodData(
            timestamp=datetime.now().isoformat(),
            pod_distribution=pod_distribution,
            events=events,
            summary={
                "total_pods": total_pods,
                "running_pods": running_pods,
                "total_nodes": len(node_pods),
                "active_nodes": len(active_nodes)
            }
        )
    except Exception as e:
        logger.error(f"통합 파드 데이터 조회 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
