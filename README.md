# 쿠버네티스 노드 격리 및 파드 마이그레이션 테스트 프로젝트

NCP 서버 6대(마스터 3대, 워커 2대, 로드밸런서 1대)를 이용한 쿠버네티스 멀티마스터 클러스터에서 노드 장애 시 파드 마이그레이션을 테스트하는 프로젝트입니다.

## 🏗️ 프로젝트 구조

```
iso-control/
├── frontend/                    # React 프론트엔드
│   ├── src/
│   │   ├── components/         # React 컴포넌트
│   │   ├── services/          # API 통신 서비스
│   │   ├── types/             # TypeScript 타입 정의
│   │   ├── hooks/             # 커스텀 React 훅
│   │   └── utils/             # 유틸리티 함수
├── backend/                     # FastAPI 백엔드
│   ├── app/
│   │   ├── routers/           # API 라우터
│   │   ├── models/            # 데이터 모델
│   │   ├── core/              # 핵심 설정
│   │   └── services/          # 비즈니스 로직
├── scripts/                     # 테스트 스크립트
│   ├── stress/                # 노드 부하/격리 스크립트
│   ├── monitoring/            # 모니터링 스크립트
│   └── run_migration_test.py  # 통합 테스트
├── tools/                       # 유틸리티 도구
├── config/                      # 환경 설정
├── manifests/                   # 쿠버네티스 매니페스트
├── docs/                        # 문서
└── docker-compose.yml          # 개발 환경 구성
```

## 🚀 빠른 시작

### 개발 환경 실행

```bash
# 전체 스택 실행 (프론트엔드 + 백엔드)
docker-compose up -d

# 프론트엔드만 실행
cd frontend && npm start

# 백엔드만 실행
cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 기존 스크립트 실행

```bash
# 환경 설정
make setup

# 노드 격리 테스트
python3 scripts/stress/node_isolation.py --node isc-worker1 --method kubelet --duration 180

# 파드 마이그레이션 모니터링
python3 scripts/monitoring/pod_migration_monitor.py

# 통합 테스트
python3 scripts/run_migration_test.py
```

## 🎯 주요 기능

### 웹 UI 기능
- **실시간 클러스터 모니터링**: 노드 상태, 파드 분포 실시간 확인
- **노드 격리 제어**: 웹 인터페이스를 통한 격리 테스트 실행
- **파드 마이그레이션 추적**: 실시간 파드 이동 모니터링
- **테스트 결과 시각화**: 차트와 그래프로 결과 분석

### 노드 격리 방법
1. **Network**: iptables로 API 서버 통신 차단
2. **Kubelet**: kubelet 서비스 중지
3. **Runtime**: 컨테이너 런타임 중지
4. **Drain**: 수동 파드 삭제
5. **Extreme**: 극한 리소스 고갈

## 🔧 기술 스택

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- React Query
- Chart.js
- Socket.IO Client

### Backend
- FastAPI
- Socket.IO
- Python 3.8+
- 기존 스크립트 통합

### Infrastructure
- Kubernetes 1.29
- NCP (Naver Cloud Platform)
- Docker & Docker Compose

## 📊 서버 정보

- **마스터 노드**: isc-master1, isc-master2, isc-master3
- **워커 노드**: isc-worker1, isc-worker2
- **로드밸런서**: isc-loadbalancer
- **네트워크**: 10.20.1.0/24 (내부), 공인 IP 할당

## 🧪 테스트 결과

✅ **성공적으로 검증된 기능**:
- SSH 패스워드 인증을 통한 원격 노드 제어
- kubelet 서비스 중지를 통한 노드 격리
- isc-worker1 → isc-worker2로 파드 자동 재스케줄링
- 클러스터 고가용성 및 자동 복구 기능

## 📝 사용법

자세한 사용법은 [docs/USAGE.md](docs/USAGE.md)를 참고하세요.

## 🤝 기여

이슈나 개선사항이 있으시면 GitHub Issues를 통해 알려주세요.

## 📄 라이선스

MIT License 