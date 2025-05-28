#!/usr/bin/env python3
"""
애플리케이션 설정
"""

from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    """애플리케이션 설정"""
    
    # API 설정
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Kubernetes Node Isolation API"
    VERSION: str = "1.0.0"
    
    # CORS 설정
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ]
    
    # 쿠버네티스 설정
    KUBECONFIG_PATH: str = os.getenv("KUBECONFIG", "~/.kube/config")
    
    # SSH 설정
    SSH_PASSWORD: str = "standing0812@"
    SSH_USER: str = "root"
    SSH_PORT: int = 22
    
    # 모니터링 설정
    MONITORING_INTERVAL: int = 10  # 초
    
    # 로그 설정
    LOG_LEVEL: str = "INFO"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

# 전역 설정 인스턴스
settings = Settings() 