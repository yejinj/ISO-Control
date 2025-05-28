# ISO Control

쿠버네티스 노드 격리 및 파드 마이그레이션 테스트 도구

## 프로젝트 구조

```
iso-control/
├── backend/           # FastAPI 백엔드
├── frontend/         # React 프론트엔드
├── scripts/          # 테스트 스크립트
├── manifests/        # 쿠버네티스 매니페스트
└── docs/            # 문서
```

## 빠른 시작

1. 환경 설정:
```bash
make setup
```

2. 테스트 애플리케이션 배포:
```bash
make deploy-test-app
```

3. 노드 격리 테스트:
```bash
make test-worker1
# 또는
make test-worker2
```

4. 모니터링:
```bash
make monitor-pods
```

## 주요 기능

- 노드 격리 시뮬레이션
- 파드 마이그레이션 모니터링
- 부하 테스트
- 실시간 상태 모니터링

## 기술 스택

- Backend: FastAPI, Python
- Frontend: React, TypeScript
- Infrastructure: Kubernetes, Docker
- Monitoring: Prometheus, Grafana

## 서버 정보

- Master Node: 211.188.52.53
- Worker1 Node: 211.188.52.54
- Worker2 Node: 211.188.52.55

## 테스트 결과

**성공적으로 검증된 기능**:
- 노드 격리 (5가지 방법)
- 파드 마이그레이션
- 부하 테스트
- 실시간 모니터링

## 사용법

자세한 사용법은 [USAGE.md](docs/USAGE.md)를 참조하세요.

## 기여

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 라이선스

MIT License 