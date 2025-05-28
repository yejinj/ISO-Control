#!/usr/bin/env python3
"""
노드 부하 테스트 스크립트
특정 노드에 CPU/메모리 부하를 주어 장애 상황을 시뮬레이션
"""

import subprocess
import time
import sys
import argparse
import threading
from pathlib import Path
import yaml

# 프로젝트 루트 디렉토리를 Python 경로에 추가
sys.path.append(str(Path(__file__).parent.parent.parent))
from tools.env_loader import EnvLoader

class NodeStressTest:
    def __init__(self):
        self.env_loader = EnvLoader()
        self.stress_processes = []
        self.monitoring_active = False
    
    def run_ssh_command(self, node_ip, command, background=False):
        """SSH를 통해 원격 노드에서 명령 실행"""
        ssh_cmd = [
            "ssh", 
            "-o", "StrictHostKeyChecking=no",
            "-o", "UserKnownHostsFile=/dev/null",
            f"root@{node_ip}",
            command
        ]
        
        try:
            if background:
                return subprocess.Popen(ssh_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            else:
                result = subprocess.run(ssh_cmd, capture_output=True, text=True, timeout=30)
                return result
        except subprocess.TimeoutExpired:
            print(f"SSH 명령 타임아웃: {node_ip}")
            return None
        except Exception as e:
            print(f"SSH 명령 실행 오류: {e}")
            return None
    
    def install_stress_tools(self, node_ip):
        """스트레스 테스트 도구 설치"""
        print(f"노드 {node_ip}에 스트레스 테스트 도구 설치 중...")
        
        # stress-ng 설치
        install_cmd = "apt-get update && apt-get install -y stress-ng htop"
        result = self.run_ssh_command(node_ip, install_cmd)
        
        if result and result.returncode == 0:
            print(f"✅ 스트레스 도구 설치 완료: {node_ip}")
            return True
        else:
            print(f"❌ 스트레스 도구 설치 실패: {node_ip}")
            return False
    
    def start_cpu_stress(self, node_ip, cpu_percentage=80, duration="300s"):
        """CPU 부하 테스트 시작"""
        print(f"노드 {node_ip}에서 CPU 부하 테스트 시작 (사용률: {cpu_percentage}%, 지속시간: {duration})")
        
        # CPU 코어 수 확인
        cpu_count_cmd = "nproc"
        result = self.run_ssh_command(node_ip, cpu_count_cmd)
        
        if not result or result.returncode != 0:
            print(f"❌ CPU 코어 수 확인 실패: {node_ip}")
            return False
        
        cpu_count = int(result.stdout.strip())
        workers = max(1, int(cpu_count * cpu_percentage / 100))
        
        # stress-ng로 CPU 부하 생성
        stress_cmd = f"stress-ng --cpu {workers} --timeout {duration} --metrics-brief"
        process = self.run_ssh_command(node_ip, stress_cmd, background=True)
        
        if process:
            self.stress_processes.append(('cpu', node_ip, process))
            print(f"✅ CPU 부하 테스트 시작됨: {node_ip} (워커: {workers}개)")
            return True
        else:
            print(f"❌ CPU 부하 테스트 시작 실패: {node_ip}")
            return False
    
    def start_memory_stress(self, node_ip, memory_percentage=70, duration="300s"):
        """메모리 부하 테스트 시작"""
        print(f"노드 {node_ip}에서 메모리 부하 테스트 시작 (사용률: {memory_percentage}%, 지속시간: {duration})")
        
        # 총 메모리 확인
        memory_cmd = "free -m | awk 'NR==2{printf \"%d\", $2}'"
        result = self.run_ssh_command(node_ip, memory_cmd)
        
        if not result or result.returncode != 0:
            print(f"❌ 메모리 정보 확인 실패: {node_ip}")
            return False
        
        total_memory = int(result.stdout.strip())
        target_memory = int(total_memory * memory_percentage / 100)
        
        # stress-ng로 메모리 부하 생성
        stress_cmd = f"stress-ng --vm 1 --vm-bytes {target_memory}M --timeout {duration} --metrics-brief"
        process = self.run_ssh_command(node_ip, stress_cmd, background=True)
        
        if process:
            self.stress_processes.append(('memory', node_ip, process))
            print(f"✅ 메모리 부하 테스트 시작됨: {node_ip} (목표: {target_memory}MB)")
            return True
        else:
            print(f"❌ 메모리 부하 테스트 시작 실패: {node_ip}")
            return False
    
    def start_combined_stress(self, node_ip, cpu_percentage=80, memory_percentage=70, duration="300s"):
        """CPU + 메모리 복합 부하 테스트"""
        print(f"노드 {node_ip}에서 복합 부하 테스트 시작...")
        
        cpu_success = self.start_cpu_stress(node_ip, cpu_percentage, duration)
        memory_success = self.start_memory_stress(node_ip, memory_percentage, duration)
        
        return cpu_success and memory_success
    
    def monitor_node_resources(self, node_ip, interval=10):
        """노드 리소스 모니터링"""
        print(f"노드 {node_ip} 리소스 모니터링 시작 (간격: {interval}초)")
        
        while self.monitoring_active:
            # CPU 사용률 확인
            cpu_cmd = "top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1"
            cpu_result = self.run_ssh_command(node_ip, cpu_cmd)
            
            # 메모리 사용률 확인
            mem_cmd = "free | grep Mem | awk '{printf \"%.1f\", $3/$2 * 100.0}'"
            mem_result = self.run_ssh_command(node_ip, mem_cmd)
            
            # 로드 평균 확인
            load_cmd = "uptime | awk -F'load average:' '{print $2}'"
            load_result = self.run_ssh_command(node_ip, load_cmd)
            
            if cpu_result and mem_result and load_result:
                cpu_usage = cpu_result.stdout.strip()
                mem_usage = mem_result.stdout.strip()
                load_avg = load_result.stdout.strip()
                
                timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
                print(f"[{timestamp}] {node_ip} - CPU: {cpu_usage}%, 메모리: {mem_usage}%, 로드: {load_avg}")
            
            time.sleep(interval)
    
    def start_monitoring(self, node_ip, interval=10):
        """백그라운드에서 모니터링 시작"""
        self.monitoring_active = True
        monitor_thread = threading.Thread(
            target=self.monitor_node_resources, 
            args=(node_ip, interval)
        )
        monitor_thread.daemon = True
        monitor_thread.start()
        return monitor_thread
    
    def stop_monitoring(self):
        """모니터링 중지"""
        self.monitoring_active = False
    
    def stop_all_stress_tests(self):
        """모든 부하 테스트 중지"""
        print("모든 부하 테스트를 중지합니다...")
        
        for stress_type, node_ip, process in self.stress_processes:
            try:
                # 원격 노드에서 stress-ng 프로세스 종료
                kill_cmd = "pkill -f stress-ng"
                self.run_ssh_command(node_ip, kill_cmd)
                
                # 로컬 프로세스 종료
                process.terminate()
                process.wait(timeout=5)
                print(f"✅ {stress_type} 부하 테스트 중지됨: {node_ip}")
            except Exception as e:
                print(f"❌ 부하 테스트 중지 실패: {node_ip} - {e}")
        
        self.stress_processes.clear()
        self.stop_monitoring()
    
    def get_node_status(self, node_ip):
        """노드 상태 확인"""
        # 노드 연결 상태 확인
        ping_cmd = f"ping -c 1 {node_ip}"
        ping_result = subprocess.run(ping_cmd.split(), capture_output=True)
        
        if ping_result.returncode != 0:
            return "UNREACHABLE"
        
        # SSH 연결 확인
        ssh_result = self.run_ssh_command(node_ip, "echo 'ok'")
        if not ssh_result or ssh_result.returncode != 0:
            return "SSH_FAILED"
        
        return "HEALTHY"

def main():
    parser = argparse.ArgumentParser(description="쿠버네티스 노드 부하 테스트")
    parser.add_argument("--node", required=True, help="테스트할 노드명 (예: worker1)")
    parser.add_argument("--type", choices=["cpu", "memory", "combined"], default="combined", 
                       help="부하 테스트 유형")
    parser.add_argument("--cpu-percent", type=int, default=80, help="CPU 사용률 (%)")
    parser.add_argument("--memory-percent", type=int, default=70, help="메모리 사용률 (%)")
    parser.add_argument("--duration", default="300s", help="테스트 지속 시간")
    parser.add_argument("--monitor", action="store_true", help="리소스 모니터링 활성화")
    parser.add_argument("--install", action="store_true", help="스트레스 도구 설치")
    
    args = parser.parse_args()
    
    stress_test = NodeStressTest()
    
    # 노드 정보 가져오기
    node_info = stress_test.env_loader.get_node_by_name(args.node)
    if not node_info:
        print(f"❌ 노드를 찾을 수 없습니다: {args.node}")
        sys.exit(1)
    
    node_ip = node_info['private_ip']
    print(f"대상 노드: {args.node} ({node_ip})")
    
    # 노드 상태 확인
    status = stress_test.get_node_status(node_ip)
    if status != "HEALTHY":
        print(f"❌ 노드 상태 이상: {status}")
        sys.exit(1)
    
    try:
        # 스트레스 도구 설치
        if args.install:
            if not stress_test.install_stress_tools(node_ip):
                sys.exit(1)
        
        # 모니터링 시작
        if args.monitor:
            stress_test.start_monitoring(node_ip)
        
        # 부하 테스트 시작
        if args.type == "cpu":
            success = stress_test.start_cpu_stress(node_ip, args.cpu_percent, args.duration)
        elif args.type == "memory":
            success = stress_test.start_memory_stress(node_ip, args.memory_percent, args.duration)
        else:  # combined
            success = stress_test.start_combined_stress(
                node_ip, args.cpu_percent, args.memory_percent, args.duration
            )
        
        if not success:
            print("❌ 부하 테스트 시작 실패")
            sys.exit(1)
        
        print(f"부하 테스트가 실행 중입니다. 지속 시간: {args.duration}")
        print("Ctrl+C를 눌러 중지할 수 있습니다.")
        
        # 테스트 완료까지 대기
        while stress_test.stress_processes:
            time.sleep(5)
            # 완료된 프로세스 제거
            stress_test.stress_processes = [
                (t, ip, p) for t, ip, p in stress_test.stress_processes 
                if p.poll() is None
            ]
        
        print("✅ 부하 테스트 완료")
        
    except KeyboardInterrupt:
        print("\n사용자에 의해 중단됨")
    finally:
        stress_test.stop_all_stress_tests()

if __name__ == "__main__":
    main() 