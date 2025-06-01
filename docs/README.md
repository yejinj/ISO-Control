# ISO Control

쿠버네티스 노드 격리 및 파드 마이그레이션 테스트 도구

## 개요

ISO Control은 쿠버네티스 클러스터에서 노드 장애 상황을 시뮬레이션하고 파드 마이그레이션을 테스트하기 위한 도구입니다.

### 주요 기능

1. **실시간 모니터링**
   - 클러스터 상태 대시보드
   - 파드 분포 시각화
   - 이벤트 로그 실시간 추적

2. **노드 격리 테스트**
   - 5가지 격리 방법 지원
   - 웹 UI를 통한 직관적인 제어
   - 자동 복구 기능

3. **파드 마이그레이션 분석**
   - 실시간 마이그레이션 추적
   - 성능 메트릭 수집
   - 결과 리포트 생성

## 시작하기

### 요구사항

- Python 3.8+
- Node.js 16+
- Docker & Docker Compose
- Kubernetes 클러스터 접근 권한

### 설치

```bash
# 저장소 클론
git clone https://github.com/your-org/iso-control.git
cd iso-control

# 환경 설정
make setup

# 서비스 실행
docker-compose up -d
```

### 웹 UI 접속

- URL: http://localhost:3000
- 기본 계정: admin
- 기본 비밀번호: admin123

## 기술 스택

### Frontend
- React 18
- TypeScript
- Material-UI
- Chart.js
- React Query

### Backend
- FastAPI
- Python 3.8+
- Socket.IO
- Kubernetes Python Client

### Infrastructure
- Docker
- Docker Compose
- Kubernetes 1.29+

## 문서

- [구현 상세](IMPLEMENTATION.md) - 기술적 구현 내용
- [사용 가이드](USAGE.md) - 실제 사용 방법 및 문제 해결

## 라이선스

MIT License 