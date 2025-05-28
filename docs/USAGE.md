# 사용 가이드

## 🚀 빠른 시작

### 1. 초기 설정
```bash
# 프로젝트 디렉토리로 이동
cd iso-control

# 초기 환경 설정
make setup

# 클러스터 노드 정보 확인
make list-nodes
```

### 2. 빠른 테스트 실행
```bash
# worker1 노드 빠른 테스트 (2분)
make quick-test-worker1

# worker2 노드 빠른 테스트 (2분)
make quick-test-worker2
```

### 3. 전체 테스트 실행
```bash
# worker1 노드 전체 테스트 (5분)
make test-worker1

# worker2 노드 전체 테스트 (5분)
make test-worker2
```

## 📊 모니터링

### 실시간 상태 확인
```bash
# 클러스터 상태 확인
make status

# 파드 분포 확인
make pod-distribution

# 실시간 파드 모니터링
make watch-pods

# 실시간 노드 모니터링
make watch-nodes
```

### 독립적인 모니터링
```bash
# 파드 마이그레이션만 모니터링
make monitor
```

## 🔥 부하 테스트

### 개별 부하 테스트
```bash
# worker1 노드에만 부하 테스트
make stress-worker1

# worker2 노드에만 부하 테스트
make stress-worker2
```

### 수동 부하 테스트
```bash
# 특정 노드에 CPU 부하만
python scripts/stress/node_stress_test.py --node worker1 --type cpu --cpu-percent 90

# 특정 노드에 메모리 부하만
python scripts/stress/node_stress_test.py --node worker1 --type memory --memory-percent 80

# 복합 부하 테스트
python scripts/stress/node_stress_test.py --node worker1 --type combined --duration 600s
```

## 📋 테스트 시나리오

### 시나리오 1: 빠른 검증
```bash
make scenario-1
```
- 테스트 애플리케이션 배포
- worker1 노드 2분 부하 테스트
- 파드 마이그레이션 모니터링
- 리소스 정리

### 시나리오 2: 전체 검증
```bash
make scenario-full
```
- 테스트 애플리케이션 배포
- 모든 워커 노드 순차 테스트
- 파드 마이그레이션 모니터링
- 리소스 정리

## 🔧 고급 사용법

### 환경변수 커스터마이징
```bash
# config/env.yaml 파일 수정 후
make env
```

### 커스텀 테스트 실행
```bash
python scripts/run_migration_test.py \
  --target-node worker1 \
  --duration 180s \
  --cpu-percent 85 \
  --memory-percent 75 \
  --monitor-interval 5 \
  --output custom_test.json
```

### 모니터링만 실행
```bash
python scripts/monitoring/pod_migration_monitor.py \
  --namespace default \
  --interval 5 \
  --output monitoring_only.json
```

## 📊 결과 분석

### 테스트 로그 확인
```bash
# 모든 테스트 결과 확인
make logs

# 특정 리포트 확인
cat migration_report_worker1.json | python -m json.tool
```

### 마이그레이션 이벤트 분석
```json
{
  "total_migrations": 3,
  "migration_events": [
    {
      "pod_name": "nginx-test-deployment-xxx",
      "namespace": "default",
      "from_node": "isc-worker1",
      "to_node": "isc-worker2",
      "timestamp": "2024-01-15T10:30:45",
      "phase": "Running",
      "ready": true
    }
  ]
}
```

## 🧹 정리

### 테스트 애플리케이션만 정리
```bash
make clean
```

### 모든 리소스 정리
```bash
make clean-all
```

## ⚠️ 주의사항

1. **SSH 키 설정**: 모든 노드에 SSH 키 기반 접속이 설정되어 있어야 합니다.
2. **kubectl 설정**: 쿠버네티스 클러스터에 접근할 수 있는 kubectl이 설정되어 있어야 합니다.
3. **네트워크 접근**: 마스터 노드에서 모든 워커 노드에 SSH 접근이 가능해야 합니다.
4. **권한**: 노드에 stress-ng 등의 도구를 설치할 수 있는 권한이 필요합니다.

## 🔍 트러블슈팅

### SSH 연결 실패
```bash
# SSH 키 확인
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
ssh-copy-id root@<node_ip>
```

### kubectl 연결 실패
```bash
# 클러스터 연결 확인
kubectl cluster-info
kubectl get nodes
```

### 파드 스케줄링 실패
```bash
# 노드 상태 확인
kubectl describe nodes
kubectl get events --sort-by=.metadata.creationTimestamp
```

## 📞 지원

문제가 발생하면 다음을 확인해주세요:
1. 모든 노드가 Ready 상태인지 확인
2. SSH 연결이 정상적으로 작동하는지 확인
3. kubectl이 클러스터에 접근할 수 있는지 확인
4. 네트워크 연결 상태 확인 