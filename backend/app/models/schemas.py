#!/usr/bin/env python3
"""
API 데이터 모델 (Pydantic 스키마)
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class NodeStatus(str, Enum):
    """노드 상태"""
    READY = "Ready"
    NOT_READY = "NotReady"
    UNKNOWN = "Unknown"

class Node(BaseModel):
    name: str
    status: str
    roles: List[str] # master, worker
    age: str
    version: str
    internal_ip: str
    external_ip: str
    os: str
    kernel: str
    container_runtime: str
    architecture: str
    cpu: str
    memory: str
    pods: str
    unschedulable: bool

class NodeList(BaseModel):
    nodes: List[Node]

class NodeListResponse(BaseModel):
    """노드 목록 응답"""
    nodes: List[Node]
    total_count: int

class PodStatus(str, Enum):
    """파드 상태"""
    RUNNING = "Running"
    PENDING = "Pending"
    SUCCEEDED = "Succeeded"
    FAILED = "Failed"
    UNKNOWN = "Unknown"
    TERMINATING = "Terminating"

class PodInfo(BaseModel):
    """파드 정보"""
    name: str
    namespace: str
    status: str
    ready: str
    restarts: int
    age: str
    ip: Optional[str] = None
    node: str
    nominated_node: Optional[str] = None
    readiness_gates: Optional[str] = None

class PodListResponse(BaseModel):
    """파드 목록 응답"""
    pods: List[PodInfo]
    total_count: int

class PodDistribution(BaseModel):
    """파드 분포"""
    node_name: str
    pod_count: int
    ready_count: int
    pods: List[PodInfo]

class PodDistributionResponse(BaseModel):
    """파드 분포 응답"""
    distributions: List[PodDistribution]
    total_pods: int

# 모니터링 관련 모델
class MonitoringEvent(BaseModel):
    """모니터링 이벤트"""
    id: str
    type: str
    reason: str
    message: str
    timestamp: str
    source: Dict[str, Any] = {
        "component": "",
        "host": None
    }
    involved_object: Dict[str, Any] = {
        "kind": "",
        "name": "",
        "namespace": ""
    }

class IntegratedPodData(BaseModel):
    """통합 파드 데이터"""
    timestamp: str
    pod_distribution: List[PodDistribution]
    events: List[MonitoringEvent]
    summary: dict = {
        "total_pods": 0,
        "running_pods": 0,
        "total_nodes": 0,
        "active_nodes": 0
    }

# 격리 관련 모델
class IsolationMethod(str, Enum):
    """격리 방법"""
    NETWORK = "network"
    KUBELET = "kubelet"
    RUNTIME = "runtime"
    DRAIN = "drain"
    EXTREME = "extreme"

class IsolationRequest(BaseModel):
    """격리 요청"""
    node_name: str = Field(..., description="격리할 노드명")
    method: IsolationMethod = Field(..., description="격리 방법")
    duration: int = Field(300, description="격리 지속 시간(초)", ge=10, le=3600)

class IsolationStatus(str, Enum):
    """격리 상태"""
    IDLE = "idle"
    RUNNING = "running"
    STOPPING = "stopping"
    COMPLETED = "completed"
    FAILED = "failed"

class IsolationResponse(BaseModel):
    """격리 응답"""
    task_id: str
    node_name: str
    method: IsolationMethod
    status: IsolationStatus
    duration: int
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    message: str

class IsolationStopRequest(BaseModel):
    """격리 중지 요청"""
    task_id: str

class ClusterStatus(BaseModel):
    """클러스터 상태"""
    timestamp: datetime
    nodes: List[Node]
    pod_distribution: List[PodDistribution]
    total_nodes: int
    ready_nodes: int
    total_pods: int
    running_pods: int

class MonitoringResponse(BaseModel):
    """모니터링 응답"""
    cluster_status: ClusterStatus
    recent_events: List[MonitoringEvent]

# 테스트 관련 모델
class TestResult(BaseModel):
    """테스트 결과"""
    test_id: str
    node_name: str
    method: IsolationMethod
    duration: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    success: bool
    migration_count: int
    migration_time: Optional[float] = None  # 초
    error_message: Optional[str] = None

class TestResultsResponse(BaseModel):
    """테스트 결과 목록 응답"""
    results: List[TestResult]
    total_count: int

# 공통 응답 모델
class SuccessResponse(BaseModel):
    """성공 응답"""
    success: bool = True
    message: str
    data: Optional[Any] = None

class ErrorResponse(BaseModel):
    """에러 응답"""
    success: bool = False
    error: str
    details: Optional[str] = None 