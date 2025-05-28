#!/usr/bin/env python3
"""
모니터링 관련 API 라우터
"""

from fastapi import APIRouter, HTTPException
import asyncio
from datetime import datetime
from typing import List

from app.models.schemas import (
    MonitoringResponse, ClusterStatus, MonitoringEvent
)
from app.routers.nodes import get_nodes
from app.routers.pods import get_pod_distribution

router = APIRouter()

# 모니터링 이벤트 저장소 (실제로는 데이터베이스 사용)
monitoring_events: List[MonitoringEvent] = []

@router.get("/cluster", response_model=ClusterStatus)
async def get_cluster_status():
    """클러스터 상태 조회"""
    try:
        # 노드 정보 조회
        nodes_response = await get_nodes()
        nodes = nodes_response.nodes
        
        # 파드 분포 조회
        pod_distribution_response = await get_pod_distribution()
        pod_distributions = pod_distribution_response.distributions
        
        # 통계 계산
        total_nodes = len(nodes)
        ready_nodes = sum(1 for node in nodes if node.status.value == "Ready")
        total_pods = pod_distribution_response.total_pods
        running_pods = sum(dist.ready_count for dist in pod_distributions)
        
        return ClusterStatus(
            timestamp=datetime.now(),
            nodes=nodes,
            pod_distribution=pod_distributions,
            total_nodes=total_nodes,
            ready_nodes=ready_nodes,
            total_pods=total_pods,
            running_pods=running_pods
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"클러스터 상태 조회 실패: {str(e)}"
        )

@router.get("/events")
async def get_monitoring_events(limit: int = 50):
    """모니터링 이벤트 조회"""
    try:
        # 최근 이벤트 반환 (최신순)
        recent_events = monitoring_events[-limit:] if monitoring_events else []
        recent_events.reverse()
        
        return {
            "events": recent_events,
            "total_count": len(monitoring_events)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"모니터링 이벤트 조회 실패: {str(e)}"
        )

@router.get("/", response_model=MonitoringResponse)
async def get_monitoring_data():
    """전체 모니터링 데이터 조회"""
    try:
        # 클러스터 상태 조회
        cluster_status = await get_cluster_status()
        
        # 최근 이벤트 조회
        recent_events = monitoring_events[-10:] if monitoring_events else []
        recent_events.reverse()
        
        return MonitoringResponse(
            cluster_status=cluster_status,
            recent_events=recent_events
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"모니터링 데이터 조회 실패: {str(e)}"
        )

def add_monitoring_event(event_type: str, message: str, **kwargs):
    """모니터링 이벤트 추가"""
    event = MonitoringEvent(
        timestamp=datetime.now(),
        event_type=event_type,
        message=message,
        **kwargs
    )
    monitoring_events.append(event)
    
    # 이벤트 개수 제한 (메모리 관리)
    if len(monitoring_events) > 1000:
        monitoring_events[:] = monitoring_events[-500:] 