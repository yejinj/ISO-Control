# Kubernetes Multi-Master Cluster Migration Test Makefile

.PHONY: setup test clean deploy-test-app test-worker1 test-worker2 monitor-pods stress-worker1 stress-worker2 status pods services distribution clean-all logs monitor-pods monitor-nodes test-scenario1 test-scenario2 test-all

# 기본 변수
PYTHON := python3
PIP := pip3
KUBECTL := kubectl

# 도움말
help:
	@echo "Kubernetes Migration Test Commands"
	@echo ""
	@echo "Usage:"
	@echo "  make setup              초기 환경 설정"
	@echo "  make test              전체 테스트 실행"
	@echo "  make clean             리소스 정리"
	@echo "  make deploy-test-app   테스트 애플리케이션 배포"
	@echo "  make test-worker1      worker1 노드 테스트"
	@echo "  make test-worker2      worker2 노드 테스트"
	@echo "  make monitor-pods      파드 모니터링"
	@echo "  make status            클러스터 상태 확인"
	@echo "  make distribution      파드 분포 확인"

# 초기 환경 설정
setup: install-deps env
	@echo "초기 환경 설정 완료"

# Python 의존성 설치
install-deps:
	@echo "Python 의존성 설치 중..."
	$(PIP) install -r requirements.txt
	@echo "의존성 설치 완료"

# 환경변수 파일 생성
env:
	@echo "환경변수 파일 생성 중..."
	$(PYTHON) tools/env_loader.py generate
	@echo "환경변수 파일 생성 완료"

# 노드 정보 출력
list-nodes:
	@echo "클러스터 노드 정보:"
	$(KUBECTL) get nodes

# 테스트 애플리케이션 배포
deploy:
	@echo "테스트 애플리케이션 배포 중..."
	$(KUBECTL) apply -f manifests/test-apps/nginx-deployment.yaml
	@echo "파드가 Ready 상태가 될 때까지 대기 중..."
	$(KUBECTL) wait --for=condition=ready pod -l app=nginx --timeout=300s
	@echo "테스트 애플리케이션 배포 완료"

# worker1 노드 마이그레이션 테스트
test-worker1:
	@echo "worker1 노드 마이그레이션 테스트 시작"
	$(PYTHON) scripts/run_migration_test.py --node isc-worker1 --duration 300

# worker2 노드 마이그레이션 테스트
test-worker2:
	@echo "worker2 노드 마이그레이션 테스트 시작"
	$(PYTHON) scripts/run_migration_test.py --node isc-worker2 --duration 300

# 빠른 테스트 (2분)
quick-test-worker1:
	@echo "worker1 노드 빠른 테스트 (2분)"
	$(PYTHON) scripts/run_migration_test.py --node isc-worker1 --duration 120

quick-test-worker2:
	@echo "worker2 노드 빠른 테스트 (2분)"
	$(PYTHON) scripts/run_migration_test.py --node isc-worker2 --duration 120

# 파드 마이그레이션 모니터링만 실행
monitor:
	@echo "파드 마이그레이션 모니터링 시작"
	$(PYTHON) scripts/monitoring/pod_migration_monitor.py

# worker1 노드에 부하만 실행
stress-worker1:
	@echo "worker1 노드 부하 테스트"
	$(PYTHON) scripts/stress/node_stress_test.py --node isc-worker1 --duration 300

# worker2 노드에 부하만 실행
stress-worker2:
	@echo "worker2 노드 부하 테스트"
	$(PYTHON) scripts/stress/node_stress_test.py --node isc-worker2 --duration 300

# 클러스터 상태 확인
status:
	@echo "클러스터 상태:"
	@echo "노드 상태:"
	$(KUBECTL) get nodes
	@echo "파드 상태:"
	$(KUBECTL) get pods -A
	@echo "서비스 상태:"
	$(KUBECTL) get services -A

# 파드 분포 확인
pod-distribution:
	@echo "파드 분포:"
	$(KUBECTL) get pods -A -o wide | grep -v "kube-system" | grep -v "default" | grep -v "ingress-nginx"

# 테스트 애플리케이션 정리
clean:
	@echo "리소스 정리 중..."
	$(KUBECTL) delete -f manifests/test-apps/nginx-deployment.yaml
	@echo "정리 완료"

# 모든 리소스 정리
clean-all: clean
	@echo "모든 리소스 정리 중..."
	$(KUBECTL) delete pods --all
	@echo "모든 리소스 정리 완료"

# 로그 확인
logs:
	@echo "최근 테스트 로그:"
	tail -n 50 backend.log

# 실시간 파드 상태 모니터링
watch-pods:
	@echo "실시간 파드 상태 모니터링 (Ctrl+C로 중지)"
	watch -n 1 'kubectl get pods -A'

# 실시간 노드 상태 모니터링
watch-nodes:
	@echo "실시간 노드 상태 모니터링 (Ctrl+C로 중지)"
	watch -n 1 'kubectl get nodes'

# 테스트 시나리오 실행
scenario-1: test-worker1-quick
	@echo "시나리오 1 완료: worker1 빠른 테스트"

scenario-2: test-worker2-quick
	@echo "시나리오 2 완료: worker2 빠른 테스트"

scenario-full: test-worker1 test-worker2 clean
	@echo "전체 시나리오 완료: 모든 워커 노드 테스트" 