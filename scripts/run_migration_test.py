#!/usr/bin/env python3
"""
통합 파드 마이그레이션 테스트 스크립트
노드 부하 테스트와 파드 마이그레이션 모니터링을 통합 실행
"""

import subprocess
import time
import sys
import argparse
import threading
import signal
from pathlib import Path
from datetime import datetime

# 프로젝트 루트 디렉토리를 Python 경로에 추가
sys.path.append(str(Path(__file__).parent.parent))
from tools.env_loader import EnvLoader
from scripts.stress.node_stress_test import NodeStressTest
from scripts.monitoring.pod_migration_monitor import PodMigrationMonitor
from scripts.stress.node_isolation import NodeIsolation

class MigrationTestOrchestrator:
    def __init__(self):
        self.env_loader = EnvLoader()
        self.stress_test = NodeStressTest()
        self.migration_monitor = PodMigrationMonitor()
        self.node_isolation = NodeIsolation()
        self.test_active = False
        self.threads = []
    
    def setup_signal_handlers(self):
        """시그널 핸들러 설정"""
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
    
    def signal_handler(self, signum, frame):
        """시그널 핸들러"""
        print(f"\n시그널 {signum} 수신됨. 테스트를 정리합니다...")
        self.cleanup()
        sys.exit(0)
    
    def run_kubectl_command(self, command):
        """kubectl 명령 실행"""
        try:
            result = subprocess.run(
                f"kubectl {command}".split(),
                capture_output=True,
                text=True,
                timeout=60
            )
            return result
        except Exception as e:
            print(f"kubectl 명령 실행 오류: {e}")
            return None
    
    def deploy_test_application(self):
        """테스트 애플리케이션 배포"""
        print("테스트 애플리케이션 배포 중...")
        
        # 기존 파드가 있는지 확인
        existing_result = self.run_kubectl_command("get pods -l app=nginx-test --no-headers")
        if existing_result and existing_result.returncode == 0 and existing_result.stdout.strip():
            print("테스트 애플리케이션이 이미 배포되어 있습니다")
            return True
        
        manifest_path = "manifests/test-apps/nginx-deployment.yaml"
        result = self.run_kubectl_command(f"apply -f {manifest_path}")
        
        if not result or result.returncode != 0:
            print(f"애플리케이션 배포 실패: {result.stderr if result else 'Unknown error'}")
            return False
        
        print("애플리케이션 배포 완료")
        
        # 파드가 Ready 상태가 될 때까지 대기 (개선된 로직)
        print("파드가 Ready 상태가 될 때까지 대기 중...")
        for i in range(60):  # 최대 5분 대기
            result = self.run_kubectl_command("get pods -l app=nginx-test --no-headers")
            if result and result.returncode == 0:
                lines = result.stdout.strip().split('\n')
                if lines and lines[0]:  # 파드가 존재하는 경우
                    ready_count = 0
                    total_count = len(lines)
                    
                    for line in lines:
                        if line.strip():
                            parts = line.split()
                            if len(parts) >= 2:
                                ready_status = parts[1]  # READY 컬럼
                                if '/' in ready_status:
                                    ready, total = ready_status.split('/')
                                    if ready == total and ready != '0':
                                        ready_count += 1
                    
                    print(f"Ready 파드: {ready_count}/{total_count}")
                    
                    if ready_count == total_count:
                        print("모든 파드가 Ready 상태입니다")
                        break
            time.sleep(5)
        else:
            print("일부 파드가 아직 Ready 상태가 아닙니다")
        
        return True
    
    def check_pod_distribution(self):
        """파드 분포 확인"""
        print("\n현재 파드 분포:")
        result = self.run_kubectl_command("get pods -l app=nginx-test -o wide")
        if result and result.returncode == 0:
            print(result.stdout)
        else:
            print("파드 분포 확인 실패")
    
    def cleanup_test_application(self):
        """테스트 애플리케이션 정리"""
        print("애플리케이션 정리 중...")
        
        manifest_path = "manifests/test-apps/nginx-deployment.yaml"
        result = self.run_kubectl_command(f"delete -f {manifest_path}")
        
        if result and result.returncode == 0:
            print("애플리케이션 정리 완료")
        else:
            print("애플리케이션 정리 중 오류 발생")
    
    def run_stress_test_thread(self, target_node, duration, cpu_percent, memory_percent):
        """부하 테스트를 별도 스레드에서 실행"""
        try:
            node_info = self.env_loader.get_node_by_name(target_node)
            if not node_info:
                print(f"노드를 찾을 수 없습니다: {target_node}")
                return
            
            node_ip = node_info['private_ip']
            print(f"노드 {target_node} ({node_ip})에 부하 테스트 시작")
            
            # 스트레스 도구 설치
            if not self.stress_test.install_stress_tools(node_ip):
                print(f"스트레스 도구 설치 실패: {target_node}")
                return
            
            # 복합 부하 테스트 시작
            success = self.stress_test.start_combined_stress(
                node_ip, cpu_percent, memory_percent, duration
            )
            
            if success:
                print(f"부하 테스트 시작됨: {target_node}")
                
                # 부하 테스트 완료까지 대기
                while self.stress_test.stress_processes and self.test_active:
                    time.sleep(5)
                    # 완료된 프로세스 제거
                    self.stress_test.stress_processes = [
                        (t, ip, p) for t, ip, p in self.stress_test.stress_processes 
                        if p.poll() is None
                    ]
                
                print(f"부하 테스트 완료: {target_node}")
            else:
                print(f"부하 테스트 시작 실패: {target_node}")
                
        except Exception as e:
            print(f"부하 테스트 스레드 오류: {e}")
    
    def run_isolation_test_thread(self, target_node, method, duration):
        """노드 격리 테스트를 별도 스레드에서 실행"""
        try:
            print(f"노드 격리 테스트 시작: {target_node} (방법: {method})")
            
            # duration이 문자열인 경우 숫자로 변환
            if isinstance(duration, str):
                duration_seconds = int(duration.replace('s', ''))
            else:
                duration_seconds = duration
            
            success = self.node_isolation.isolate_node(target_node, method, duration_seconds)
            
            if success:
                print(f"노드 격리 시작됨: {target_node}")
                
                # 격리 시간 동안 대기
                time.sleep(duration_seconds)
                
                print(f"노드 격리 완료: {target_node}")
            else:
                print(f"노드 격리 시작 실패: {target_node}")
                
        except Exception as e:
            print(f"노드 격리 스레드 오류: {e}")
    
    def run_monitoring_thread(self, namespace, interval, output_file):
        """모니터링을 별도 스레드에서 실행"""
        try:
            print(f"파드 마이그레이션 모니터링 시작 (네임스페이스: {namespace})")
            self.migration_monitor.monitoring_active = True
            self.migration_monitor.monitor_loop(namespace, interval)
        except Exception as e:
            print(f"모니터링 스레드 오류: {e}")
        finally:
            if output_file:
                self.migration_monitor.export_migration_report(output_file)
    
    def run_integrated_test(self, target_node, duration="300s", cpu_percent=80, 
                          memory_percent=70, namespace="default", monitor_interval=10,
                          output_file=None, cleanup=True, isolation_method="stress"):
        """통합 테스트 실행"""
        print("="*80)
        print("쿠버네티스 파드 마이그레이션 테스트 시작")
        print("="*80)
        print(f"대상 노드: {target_node}")
        print(f"테스트 지속시간: {duration}")
        print(f"격리 방법: {isolation_method}")
        if isolation_method == "stress":
            print(f"CPU 부하: {cpu_percent}%")
            print(f"메모리 부하: {memory_percent}%")
        print(f"모니터링 네임스페이스: {namespace}")
        print("="*80)
        
        self.test_active = True
        
        try:
            # 1. 테스트 애플리케이션 배포
            if not self.deploy_test_application():
                return False
            
            # 2. 초기 파드 분포 확인
            self.check_pod_distribution()
            
            # 3. 모니터링 시작
            monitor_thread = threading.Thread(
                target=self.run_monitoring_thread,
                args=(namespace, monitor_interval, output_file)
            )
            monitor_thread.daemon = True
            monitor_thread.start()
            self.threads.append(monitor_thread)
            
            # 모니터링이 시작될 시간을 줌
            time.sleep(5)
            
            # 4. 노드 격리/부하 테스트 시작
            if isolation_method == "stress":
                stress_thread = threading.Thread(
                    target=self.run_stress_test_thread,
                    args=(target_node, duration, cpu_percent, memory_percent)
                )
                stress_thread.daemon = True
                stress_thread.start()
                self.threads.append(stress_thread)
                test_thread = stress_thread
            else:
                isolation_thread = threading.Thread(
                    target=self.run_isolation_test_thread,
                    args=(target_node, isolation_method, duration)
                )
                isolation_thread.daemon = True
                isolation_thread.start()
                self.threads.append(isolation_thread)
                test_thread = isolation_thread
            
            print(f"\n테스트 실행 중... (지속시간: {duration})")
            print("Ctrl+C를 눌러 중지할 수 있습니다.\n")
            
            # 5. 테스트 완료까지 대기
            test_thread.join()
            
            # 6. 추가 모니터링 시간 (복구 과정 관찰)
            print("\n복구 과정 모니터링 중... (60초)")
            time.sleep(60)
            
            print("\n테스트 완료")
            
            # 7. 최종 파드 분포 확인
            print("\n최종 파드 분포:")
            self.check_pod_distribution()
            
            return True
            
        except KeyboardInterrupt:
            print("\n사용자에 의해 테스트가 중단되었습니다.")
            return False
        except Exception as e:
            print(f"\n테스트 실행 중 오류 발생: {e}")
            return False
        finally:
            self.cleanup()
            if cleanup:
                self.cleanup_test_application()
    
    def cleanup(self):
        """리소스 정리"""
        print("\n리소스 정리 중...")
        
        self.test_active = False
        
        # 부하 테스트 중지
        self.stress_test.stop_all_stress_tests()
        
        # 노드 격리 중지
        self.node_isolation.stop_isolation()
        
        # 모니터링 중지
        self.migration_monitor.stop_monitoring()
        
        # 스레드 정리
        for thread in self.threads:
            if thread.is_alive():
                thread.join(timeout=5)
        
        print("리소스 정리 완료")

def main():
    parser = argparse.ArgumentParser(description="쿠버네티스 파드 마이그레이션 통합 테스트")
    parser.add_argument("--target-node", required=True, 
                       help="부하를 줄 대상 노드명 (예: worker1)")
    parser.add_argument("--duration", default="300s", 
                       help="부하 테스트 지속 시간 (기본: 300s)")
    parser.add_argument("--cpu-percent", type=int, default=80, 
                       help="CPU 부하 비율 (기본: 80%)")
    parser.add_argument("--memory-percent", type=int, default=70, 
                       help="메모리 부하 비율 (기본: 70%)")
    parser.add_argument("--namespace", default="default", 
                       help="모니터링할 네임스페이스 (기본: default)")
    parser.add_argument("--monitor-interval", type=int, default=10, 
                       help="모니터링 간격 초 (기본: 10)")
    parser.add_argument("--output", 
                       help="마이그레이션 리포트 출력 파일")
    parser.add_argument("--no-cleanup", action="store_true", 
                       help="테스트 후 애플리케이션을 정리하지 않음")
    parser.add_argument("--isolation-method", 
                       choices=["stress", "network", "kubelet", "runtime", "drain", "extreme"],
                       default="stress",
                       help="노드 격리 방법 (기본: stress)")
    
    args = parser.parse_args()
    
    orchestrator = MigrationTestOrchestrator()
    orchestrator.setup_signal_handlers()
    
    # 환경변수 파일 생성
    print("환경변수 파일 생성 중...")
    orchestrator.env_loader.generate_bash_env()
    
    success = orchestrator.run_integrated_test(
        target_node=args.target_node,
        duration=args.duration,
        cpu_percent=args.cpu_percent,
        memory_percent=args.memory_percent,
        namespace=args.namespace,
        monitor_interval=args.monitor_interval,
        output_file=args.output,
        cleanup=not args.no_cleanup,
        isolation_method=args.isolation_method
    )
    
    if success:
        print("\n 테스트가 성공적으로 완료되었습니다!")
        sys.exit(0)
    else:
        print("\n 테스트가 실패했습니다.")
        sys.exit(1)

if __name__ == "__main__":
    main() 