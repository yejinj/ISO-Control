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
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    
    # URL 설정
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8000")
    
    # CORS 설정
    @property
    def BACKEND_CORS_ORIGINS(self) -> List[str]:
        """CORS 허용 오리진 동적 생성"""
        origins = [
            self.FRONTEND_URL,
            self.BACKEND_URL,
        ]
        # 추가 CORS 오리진이 있으면 환경변수에서 읽기
        extra_origins = os.getenv("EXTRA_CORS_ORIGINS", "")
        if extra_origins:
            origins.extend([origin.strip() for origin in extra_origins.split(",")])
        return origins
    
    # 쿠버네티스 설정
    KUBECONFIG_PATH: str = os.getenv("KUBECONFIG", "~/.kube/config")
    
    # SSH 설정
    SSH_PASSWORD: str = os.getenv("SSH_PASSWORD", "")
    SSH_USER: str = os.getenv("SSH_USER", "")
    SSH_PORT: int = int(os.getenv("SSH_PORT", "22"))
    
    # 모니터링 설정
    MONITORING_INTERVAL: int = int(os.getenv("MONITORING_INTERVAL", "10"))
    
    # 로그 설정
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    class Config:
        case_sensitive = True
        env_file = ".env"

# 전역 설정 인스턴스
settings = Settings() 