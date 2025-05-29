#!/usr/bin/env python3
"""
FastAPI 기반 백엔드 서버
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from datetime import datetime
import asyncio

app = FastAPI(title="Kubernetes Node Isolation API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 데이터 모델
class NodeStatus(BaseModel):
    name: str
    status: str
    pods: int
    cpu: str
    memory: str

class PodDistribution(BaseModel):
    node_name: str
    pod_count: int
    ready_count: int

class ClusterStatus(BaseModel):
    timestamp: str
    nodes: List[NodeStatus]
    pod_distribution: List[PodDistribution]
    total_nodes: int
    ready_nodes: int
    total_pods: int
    running_pods: int

class IsolationRequest(BaseModel):
    node_name: str
    method: str
    duration: int

class IsolationResponse(BaseModel):
    task_id: str
    status: str
    message: str

# 샘플 데이터
SAMPLE_CLUSTER_STATUS = ClusterStatus(
    timestamp=datetime.now().isoformat(),
    nodes=[
        NodeStatus(name="isc-master1", status="Ready", pods=8, cpu="15%", memory="45%"),
        NodeStatus(name="isc-master2", status="Ready", pods=7, cpu="12%", memory="38%"),
        NodeStatus(name="isc-master3", status="Ready", pods=6, cpu="18%", memory="42%"),
        NodeStatus(name="isc-worker1", status="Ready", pods=3, cpu="25%", memory="55%"),
        NodeStatus(name="isc-worker2", status="Ready", pods=3, cpu="22%", memory="48%")
    ],
    pod_distribution=[
        PodDistribution(node_name="isc-worker1", pod_count=3, ready_count=3),
        PodDistribution(node_name="isc-worker2", pod_count=3, ready_count=3)
    ],
    total_nodes=5,
    ready_nodes=5,
    total_pods=27,
    running_pods=27
)

@app.get("/api/v1/monitoring/cluster", response_model=ClusterStatus)
async def get_cluster_status():
    """클러스터 상태 조회"""
    return SAMPLE_CLUSTER_STATUS

@app.get("/api/v1/monitoring/events")
async def get_monitoring_events(limit: int = 50):
    """모니터링 이벤트 조회"""
    events = [
        {
            "timestamp": datetime.now().isoformat(),
            "event_type": "info",
            "message": "클러스터 상태 정상",
            "node_name": None,
            "pod_name": None
        }
    ]
    return {"events": events}

@app.post("/api/v1/isolation/start", response_model=IsolationResponse)
async def start_isolation(request: IsolationRequest):
    """노드 격리 시작"""
    task_id = f"task-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    return IsolationResponse(
        task_id=task_id,
        status="started",
        message=f"{request.node_name} 노드 격리가 시작되었습니다 ({request.method})"
    )

@app.get("/api/v1/isolation/status/{task_id}")
async def get_isolation_status(task_id: str):
    """격리 작업 상태 조회"""
    return {
        "task_id": task_id,
        "status": "running",
        "message": "격리 작업 진행 중"
    }

@app.post("/api/v1/isolation/stop")
async def stop_isolation(task_id: str):
    """격리 작업 중지"""
    return {
        "task_id": task_id,
        "status": "stopped",
        "message": "격리 작업이 중지되었습니다"
    }

if __name__ == "__main__":
    print("🚀 FastAPI 백엔드 서버 시작 - http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True) 