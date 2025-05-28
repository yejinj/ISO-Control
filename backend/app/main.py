#!/usr/bin/env python3
"""
FastAPI 메인 애플리케이션
쿠버네티스 노드 격리 및 파드 마이그레이션 테스트 API
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import socketio
import uvicorn

from app.core.config import settings
from app.routers import nodes, pods, isolation, monitoring

# Socket.IO 서버 생성
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True
)

# FastAPI 앱 생성
app = FastAPI(
    title="Kubernetes Node Isolation API",
    description="쿠버네티스 노드 격리 및 파드 마이그레이션 테스트 API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 환경에서는 모든 오리진 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Socket.IO 앱 마운트
socket_app = socketio.ASGIApp(sio, app)

# API 라우터 등록
app.include_router(nodes.router, prefix="/api/v1/nodes", tags=["nodes"])
app.include_router(pods.router, prefix="/api/v1/pods", tags=["pods"])
app.include_router(isolation.router, prefix="/api/v1/isolation", tags=["isolation"])
app.include_router(monitoring.router, prefix="/api/v1/monitoring", tags=["monitoring"])

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "Kubernetes Node Isolation API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {"status": "healthy"}

# Socket.IO 이벤트 핸들러
@sio.event
async def connect(sid, environ):
    """클라이언트 연결"""
    print(f"Client {sid} connected")
    await sio.emit('connected', {'message': 'Connected to server'}, room=sid)

@sio.event
async def disconnect(sid):
    """클라이언트 연결 해제"""
    print(f"Client {sid} disconnected")

@sio.event
async def join_room(sid, data):
    """룸 참가"""
    room = data.get('room', 'default')
    await sio.enter_room(sid, room)
    await sio.emit('joined_room', {'room': room}, room=sid)

if __name__ == "__main__":
    uvicorn.run(
        "app.main:socket_app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 