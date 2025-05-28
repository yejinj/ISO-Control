# Kubernetes Multi-Master Cluster Migration Test Makefile

.PHONY: help setup env test-worker1 test-worker2 monitor deploy clean install-deps

# 기본 변수
PYTHON := python3
PIP := pip3
KUBECTL := kubectl

# 도움말
help:
	@echo "🚀 Kubernetes Migration Test Commands"
	@echo "=================================="
	@echo "setup          - 초기 환경 설정"
	@echo "env            - 환경변수 파일 생성"
	@echo "install-deps   - Python 의존성 설치"
	@echo "deploy         - 테스트 애플리케이션 배포"
	@echo "test-worker1   - worker1 노드 마이그레이션 테스트"
	@echo "test-worker2   - worker2 노드 마이그레이션 테스트"
	@echo "monitor        - 파드 마이그레이션 모니터링만 실행"
	@echo "stress-worker1 - worker1 노드에 부하만 실행"
	@echo "stress-worker2 - worker2 노드에 부하만 실행"
	@echo "clean          - 테스트 애플리케이션 정리"
	@echo "status         - 클러스터 상태 확인"
	@echo "logs           - 테스트 로그 확인"

# 초기 환경 설정
setup: install-deps env
	@echo "✅ 초기 환경 설정 완료"

# Python 의존성 설치
install-deps:
	@echo "📦 Python 의존성 설치 중..."
	$(PIP) install pyyaml
	@echo "✅ 의존성 설치 완료"

# 환경변수 파일 생성
env:
	@echo "🔧 환경변수 파일 생성 중..."
	$(PYTHON) tools/env_loader.py generate
	@echo "✅ 환경변수 파일 생성 완료"

# 노드 정보 출력
list-nodes:
	@echo "📋 클러스터 노드 정보:"
	$(PYTHON) tools/env_loader.py list

# 테스트 애플리케이션 배포
deploy:
	@echo "🚀 테스트 애플리케이션 배포 중..."
	$(KUBECTL) apply -f manifests/test-apps/nginx-deployment.yaml
	@echo "⏳ 파드가 Ready 상태가 될 때까지 대기 중..."
	$(KUBECTL) wait --for=condition=ready pod -l app=nginx-test --timeout=300s
	@echo "✅ 테스트 애플리케이션 배포 완료"

# worker1 노드 마이그레이션 테스트
test-worker1:
	@echo "🔥 worker1 노드 마이그레이션 테스트 시작"
	$(PYTHON) scripts/run_migration_test.py --target-node worker1 --output migration_report_worker1.json

# worker2 노드 마이그레이션 테스트
test-worker2:
	@echo "🔥 worker2 노드 마이그레이션 테스트 시작"
	$(PYTHON) scripts/run_migration_test.py --target-node worker2 --output migration_report_worker2.json

# 빠른 테스트 (2분)
quick-test-worker1:
	@echo "⚡ worker1 노드 빠른 테스트 (2분)"
	$(PYTHON) scripts/run_migration_test.py --target-node worker1 --duration 120s --output quick_test_worker1.json

quick-test-worker2:
	@echo "⚡ worker2 노드 빠른 테스트 (2분)"
	$(PYTHON) scripts/run_migration_test.py --target-node worker2 --duration 120s --output quick_test_worker2.json

# 파드 마이그레이션 모니터링만 실행
monitor:
	@echo "👀 파드 마이그레이션 모니터링 시작"
	$(PYTHON) scripts/monitoring/pod_migration_monitor.py --output monitor_report.json

# worker1 노드에 부하만 실행
stress-worker1:
	@echo "🔥 worker1 노드 부하 테스트"
	$(PYTHON) scripts/stress/node_stress_test.py --node worker1 --monitor --install

# worker2 노드에 부하만 실행
stress-worker2:
	@echo "🔥 worker2 노드 부하 테스트"
	$(PYTHON) scripts/stress/node_stress_test.py --node worker2 --monitor --install

# 클러스터 상태 확인
status:
	@echo "📊 클러스터 상태:"
	@echo "=================="
	@echo "🖥️  노드 상태:"
	$(KUBECTL) get nodes -o wide
	@echo ""
	@echo "📦 파드 상태:"
	$(KUBECTL) get pods -o wide
	@echo ""
	@echo "🔧 서비스 상태:"
	$(KUBECTL) get services

# 파드 분포 확인
pod-distribution:
	@echo "📊 파드 분포:"
	$(KUBECTL) get pods -l app=nginx-test -o wide

# 테스트 애플리케이션 정리
clean:
	@echo "🧹 테스트 애플리케이션 정리 중..."
	$(KUBECTL) delete -f manifests/test-apps/nginx-deployment.yaml --ignore-not-found=true
	@echo "✅ 정리 완료"

# 모든 리소스 정리
clean-all: clean
	@echo "🧹 모든 리소스 정리 중..."
	rm -f *.json
	rm -f config/env.sh
	@echo "✅ 모든 리소스 정리 완료"

# 로그 확인
logs:
	@echo "📋 최근 테스트 로그:"
	@if [ -f migration_report_worker1.json ]; then \
		echo "=== Worker1 마이그레이션 리포트 ==="; \
		cat migration_report_worker1.json | $(PYTHON) -m json.tool; \
	fi
	@if [ -f migration_report_worker2.json ]; then \
		echo "=== Worker2 마이그레이션 리포트 ==="; \
		cat migration_report_worker2.json | $(PYTHON) -m json.tool; \
	fi

# 실시간 파드 상태 모니터링
watch-pods:
	@echo "👀 실시간 파드 상태 모니터링 (Ctrl+C로 중지)"
	watch -n 2 "kubectl get pods -l app=nginx-test -o wide"

# 실시간 노드 상태 모니터링
watch-nodes:
	@echo "👀 실시간 노드 상태 모니터링 (Ctrl+C로 중지)"
	watch -n 5 "kubectl get nodes -o wide"

# 테스트 시나리오 실행
scenario-1: deploy quick-test-worker1 clean
	@echo "✅ 시나리오 1 완료: worker1 빠른 테스트"

scenario-2: deploy quick-test-worker2 clean
	@echo "✅ 시나리오 2 완료: worker2 빠른 테스트"

scenario-full: deploy test-worker1 test-worker2 clean
	@echo "✅ 전체 시나리오 완료: 모든 워커 노드 테스트" 