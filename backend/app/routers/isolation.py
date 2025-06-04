#!/usr/bin/env python3
"""
격리 관련 API 라우터
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
import asyncio
import uuid
import sys
import os
from datetime import datetime
from typing import Dict

# 기존 스크립트 경로 추가
sys.path.append(os.path.join(os.path.dirname(__file__), "../../../"))
from scripts.stress.node_isolation import isolate_node

from app.models.schemas import (
    IsolationRequest, IsolationResponse, IsolationStatus, 
    IsolationStopRequest, SuccessResponse
)

router = APIRouter()

# 실행 중인 격리 작업 추적
running_tasks: Dict[str, dict] = {}

class IsolationService:
    async def run_isolation(self, task_id: str, request: IsolationRequest):
        """격리 작업 실행"""
        try:
            # 작업 상태 업데이트
            running_tasks[task_id]["status"] = IsolationStatus.RUNNING
            running_tasks[task_id]["started_at"] = datetime.now()
            
            # 격리 실행
            isolate_node(
                node=request.node_name,
                method=request.method,
                duration=request.duration
            )
            
            # 작업 완료
            running_tasks[task_id]["status"] = IsolationStatus.COMPLETED
            running_tasks[task_id]["completed_at"] = datetime.now()
            running_tasks[task_id]["message"] = "격리 작업이 완료되었습니다."
            
        except Exception as e:
            running_tasks[task_id]["status"] = IsolationStatus.FAILED
            running_tasks[task_id]["completed_at"] = datetime.now()
            running_tasks[task_id]["message"] = f"격리 작업 중 오류 발생: {str(e)}"

isolation_service = IsolationService()

@router.post("/start", response_model=IsolationResponse)
async def start_isolation(request: IsolationRequest, background_tasks: BackgroundTasks):
    """노드 격리 시작"""
    try:
        # 요청 데이터 로깅
        print(f"격리 요청: {request.dict()}")
        
        # 작업 ID 생성
        task_id = str(uuid.uuid4())
        
        # 작업 정보 저장
        running_tasks[task_id] = {
            "task_id": task_id,
            "node_name": request.node_name,
            "method": request.method,
            "duration": request.duration,
            "status": IsolationStatus.IDLE,
            "started_at": None,
            "completed_at": None,
            "message": "격리 작업이 대기 중입니다."
        }
        
        # 백그라운드에서 격리 작업 실행
        background_tasks.add_task(
            isolation_service.run_isolation,
            task_id,
            request
        )
        
        return IsolationResponse(
            task_id=task_id,
            node_name=request.node_name,
            method=request.method,
            status=IsolationStatus.IDLE,
            duration=request.duration,
            message="격리 작업이 시작되었습니다."
        )
        
    except Exception as e:
        print(f"격리 시작 오류: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"격리 작업 시작 실패: {str(e)}"
        )

@router.get("/status/{task_id}", response_model=IsolationResponse)
async def get_isolation_status(task_id: str):
    """격리 작업 상태 조회"""
    if task_id not in running_tasks:
        raise HTTPException(
            status_code=404,
            detail="격리 작업을 찾을 수 없습니다."
        )
    
    task_info = running_tasks[task_id]
    
    return IsolationResponse(
        task_id=task_id,
        node_name=task_info["node_name"],
        method=task_info["method"],
        status=task_info["status"],
        duration=task_info["duration"],
        started_at=task_info["started_at"],
        completed_at=task_info["completed_at"],
        message=task_info["message"]
    )

@router.post("/stop", response_model=SuccessResponse)
async def stop_isolation(request: IsolationStopRequest):
    """격리 작업 중지"""
    try:
        if request.task_id not in running_tasks:
            raise HTTPException(
                status_code=404,
                detail="격리 작업을 찾을 수 없습니다."
            )
        
        task_info = running_tasks[request.task_id]
        
        if task_info["status"] not in [IsolationStatus.IDLE, IsolationStatus.RUNNING]:
            raise HTTPException(
                status_code=400,
                detail="중지할 수 있는 상태가 아닙니다."
            )
        
        # 상태 업데이트
        running_tasks[request.task_id]["status"] = IsolationStatus.STOPPING
        running_tasks[request.task_id]["message"] = "격리 작업이 중지되었습니다."
        
        return SuccessResponse(
            message="격리 작업이 중지되었습니다."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"격리 작업 중지 실패: {str(e)}"
        )

@router.get("/tasks")
async def get_all_tasks():
    """모든 격리 작업 목록 조회"""
    return {
        "tasks": list(running_tasks.values()),
        "total_count": len(running_tasks)
    } 