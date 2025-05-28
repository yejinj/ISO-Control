#!/usr/bin/env python3
"""
노드 격리 스크립트
쿠버네티스 내장 기능이 아닌 직접 구현한 방식으로 노드를 격리
"""

import subprocess
import time
import sys
import argparse
import threading
from pathlib import Path

# 프로젝트 루트 디렉토리를 Python 경로에 추가
sys.path.append(str(Path(__file__).parent.parent.parent))
from tools.env_loader import EnvLoader

class NodeIsolation:
    def __init__(self):
        self.env_loader = EnvLoader()
        self.isolation_active = False
        self.isolation_processes = []
        self.ssh_password = "standing0812@"  # 모든 노드의 공통 패스워드
    
    def run_ssh_command(self, node_ip, command, background=False):
        """SSH를 통해 원격 노드에서 명령 실행 (패스워드 인증 사용)"""
        ssh_cmd = [
            "sshpass", "-p", self.ssh_password,
            "ssh", 
            "-o", "StrictHostKeyChecking=no",
            "-o", "UserKnownHostsFile=/dev/null",
            "-o", "ConnectTimeout=10",
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
            print(f"❌ SSH 명령 타임아웃: {node_ip}")
            return None
        except Exception as e:
            print(f"❌ SSH 명령 실행 오류: {e}")
            return None
    
    def run_kubectl_command(self, command):
        """kubectl 명령 실행"""
        try:
            result = subprocess.run(
                f"kubectl {command}".split(),
                capture_output=True,
                text=True,
                timeout=30
            )
            return result
        except Exception as e:
            print(f"kubectl 명령 실행 오류: {e}")
            return None
    
    def method1_network_isolation(self, node_ip, duration=300):
        """방법 1: 네트워크 격리 - iptables로 API 서버 통신 차단"""
        print(f"🔥 방법 1: 네트워크 격리 시작 - {node_ip}")
        
        # API 서버 IP 확인
        api_server_result = self.run_kubectl_command("cluster-info")
        if not api_server_result:
            print("❌ API 서버 정보 확인 실패")
            return False
        
        # 마스터 노드들의 IP 가져오기
        masters = self.env_loader.get_masters()
        master_ips = [info['private_ip'] for info in masters.values()]
        
        # iptables 규칙으로 API 서버 통신 차단
        for master_ip in master_ips:
            # API 서버 포트(6443) 차단
            block_cmd = f"iptables -A OUTPUT -d {master_ip} -p tcp --dport 6443 -j DROP"
            result = self.run_ssh_command(node_ip, block_cmd)
            if result and result.returncode == 0:
                print(f"✅ API 서버 {master_ip}:6443 통신 차단")
            else:
                print(f"❌ API 서버 {master_ip}:6443 통신 차단 실패")
        
        # 지정된 시간 후 복구
        def restore_network():
            time.sleep(duration)
            print(f"🔄 네트워크 격리 해제 중 - {node_ip}")
            for master_ip in master_ips:
                restore_cmd = f"iptables -D OUTPUT -d {master_ip} -p tcp --dport 6443 -j DROP"
                self.run_ssh_command(node_ip, restore_cmd)
            print(f"✅ 네트워크 격리 해제 완료 - {node_ip}")
        
        restore_thread = threading.Thread(target=restore_network)
        restore_thread.daemon = True
        restore_thread.start()
        
        return True
    
    def method2_kubelet_stop(self, node_ip, duration=300):
        """방법 2: kubelet 서비스 중지"""
        print(f"🔥 방법 2: kubelet 서비스 중지 - {node_ip}")
        
        # kubelet 중지
        stop_cmd = "systemctl stop kubelet"
        result = self.run_ssh_command(node_ip, stop_cmd)
        
        if result and result.returncode == 0:
            print(f"✅ kubelet 서비스 중지됨 - {node_ip}")
        else:
            print(f"❌ kubelet 서비스 중지 실패 - {node_ip}")
            return False
        
        # 지정된 시간 후 복구
        def restore_kubelet():
            time.sleep(duration)
            print(f"🔄 kubelet 서비스 재시작 중 - {node_ip}")
            start_cmd = "systemctl start kubelet"
            result = self.run_ssh_command(node_ip, start_cmd)
            if result and result.returncode == 0:
                print(f"✅ kubelet 서비스 재시작 완료 - {node_ip}")
            else:
                print(f"❌ kubelet 서비스 재시작 실패 - {node_ip}")
        
        restore_thread = threading.Thread(target=restore_kubelet)
        restore_thread.daemon = True
        restore_thread.start()
        
        return True
    
    def method3_container_runtime_stop(self, node_ip, duration=300):
        """방법 3: 컨테이너 런타임 중지 (containerd/docker)"""
        print(f"🔥 방법 3: 컨테이너 런타임 중지 - {node_ip}")
        
        # containerd 또는 docker 확인
        check_containerd = "systemctl is-active containerd"
        check_docker = "systemctl is-active docker"
        
        containerd_result = self.run_ssh_command(node_ip, check_containerd)
        docker_result = self.run_ssh_command(node_ip, check_docker)
        
        runtime_service = None
        if containerd_result and "active" in containerd_result.stdout:
            runtime_service = "containerd"
        elif docker_result and "active" in docker_result.stdout:
            runtime_service = "docker"
        else:
            print(f"❌ 컨테이너 런타임을 찾을 수 없음 - {node_ip}")
            return False
        
        # 런타임 중지
        stop_cmd = f"systemctl stop {runtime_service}"
        result = self.run_ssh_command(node_ip, stop_cmd)
        
        if result and result.returncode == 0:
            print(f"✅ {runtime_service} 서비스 중지됨 - {node_ip}")
        else:
            print(f"❌ {runtime_service} 서비스 중지 실패 - {node_ip}")
            return False
        
        # 지정된 시간 후 복구
        def restore_runtime():
            time.sleep(duration)
            print(f"🔄 {runtime_service} 서비스 재시작 중 - {node_ip}")
            start_cmd = f"systemctl start {runtime_service}"
            result = self.run_ssh_command(node_ip, start_cmd)
            if result and result.returncode == 0:
                print(f"✅ {runtime_service} 서비스 재시작 완료 - {node_ip}")
            else:
                print(f"❌ {runtime_service} 서비스 재시작 실패 - {node_ip}")
        
        restore_thread = threading.Thread(target=restore_runtime)
        restore_thread.daemon = True
        restore_thread.start()
        
        return True
    
    def method4_node_drain_manual(self, node_name, duration=300):
        """방법 4: 수동 노드 드레인 (kubectl 사용하지만 직접 구현)"""
        print(f"🔥 방법 4: 수동 노드 드레인 - {node_name}")
        
        # 노드의 파드 목록 가져오기
        get_pods_cmd = f"get pods --all-namespaces --field-selector spec.nodeName={node_name} -o jsonpath='{{.items[*].metadata.name}}'"
        result = self.run_kubectl_command(get_pods_cmd)
        
        if not result or result.returncode != 0:
            print(f"❌ 노드 {node_name}의 파드 목록 조회 실패")
            return False
        
        pod_names = result.stdout.strip().split()
        if not pod_names or pod_names == ['']:
            print(f"⚠️  노드 {node_name}에 파드가 없습니다")
            return True
        
        print(f"📦 노드 {node_name}에서 {len(pod_names)}개 파드 발견")
        
        # 각 파드를 수동으로 삭제
        deleted_pods = []
        for pod_name in pod_names:
            if pod_name:  # 빈 문자열 제외
                # 파드의 네임스페이스 확인
                get_ns_cmd = f"get pod {pod_name} --all-namespaces -o jsonpath='{{.metadata.namespace}}'"
                ns_result = self.run_kubectl_command(get_ns_cmd)
                
                if ns_result and ns_result.returncode == 0:
                    namespace = ns_result.stdout.strip()
                    
                    # 파드 삭제
                    delete_cmd = f"delete pod {pod_name} -n {namespace} --force --grace-period=0"
                    delete_result = self.run_kubectl_command(delete_cmd)
                    
                    if delete_result and delete_result.returncode == 0:
                        print(f"✅ 파드 삭제됨: {pod_name} (namespace: {namespace})")
                        deleted_pods.append((pod_name, namespace))
                    else:
                        print(f"❌ 파드 삭제 실패: {pod_name}")
        
        print(f"✅ 총 {len(deleted_pods)}개 파드가 삭제되어 다른 노드로 재스케줄링됩니다")
        return True
    
    def method5_extreme_resource_exhaustion(self, node_ip, duration=300):
        """방법 5: 극한 리소스 고갈 (메모리 99% 사용)"""
        print(f"🔥 방법 5: 극한 리소스 고갈 - {node_ip}")
        
        # 사용 가능한 메모리의 99% 사용
        memory_cmd = "free -m | awk 'NR==2{printf \"%d\", $2 * 0.99}'"
        result = self.run_ssh_command(node_ip, memory_cmd)
        
        if not result or result.returncode != 0:
            print(f"❌ 메모리 정보 확인 실패: {node_ip}")
            return False
        
        target_memory = result.stdout.strip()
        
        # stress-ng로 극한 부하 생성
        stress_cmd = f"stress-ng --vm 1 --vm-bytes {target_memory}M --timeout {duration}s --metrics-brief"
        process = self.run_ssh_command(node_ip, stress_cmd, background=True)
        
        if process:
            print(f"✅ 극한 리소스 고갈 시작됨: {node_ip} (메모리: {target_memory}MB)")
            self.isolation_processes.append(('extreme_stress', node_ip, process))
            return True
        else:
            print(f"❌ 극한 리소스 고갈 시작 실패: {node_ip}")
            return False
    
    def isolate_node(self, node_name, method="network", duration=300):
        """노드 격리 실행"""
        # 먼저 환경 설정에서 노드 정보 찾기
        node_info = self.env_loader.get_node_by_name(node_name)
        
        # 환경 설정에서 찾지 못한 경우, 실제 쿠버네티스 노드 이름으로 매핑 시도
        if not node_info:
            # isc-worker1 -> worker1, isc-worker2 -> worker2 매핑
            if node_name.startswith("isc-"):
                mapped_name = node_name.replace("isc-", "")
                node_info = self.env_loader.get_node_by_name(mapped_name)
            
            if not node_info:
                print(f"❌ 노드를 찾을 수 없습니다: {node_name}")
                print("사용 가능한 노드:")
                all_nodes = self.env_loader.get_all_nodes()
                for name in all_nodes.keys():
                    print(f"  - {name}")
                return False
        
        node_ip = node_info['private_ip']
        
        print(f"🎯 노드 격리 시작: {node_name} ({node_ip})")
        print(f"📋 격리 방법: {method}")
        print(f"⏱️  지속 시간: {duration}초")
        
        if method == "network":
            return self.method1_network_isolation(node_ip, duration)
        elif method == "kubelet":
            return self.method2_kubelet_stop(node_ip, duration)
        elif method == "runtime":
            return self.method3_container_runtime_stop(node_ip, duration)
        elif method == "drain":
            # drain 방법의 경우 실제 쿠버네티스 노드 이름 사용
            return self.method4_node_drain_manual(node_name, duration)
        elif method == "extreme":
            return self.method5_extreme_resource_exhaustion(node_ip, duration)
        else:
            print(f"❌ 알 수 없는 격리 방법: {method}")
            return False
    
    def stop_isolation(self):
        """격리 중지"""
        print("🛑 모든 격리 프로세스를 중지합니다...")
        
        for isolation_type, node_ip, process in self.isolation_processes:
            try:
                # 원격 노드에서 stress-ng 프로세스 종료
                kill_cmd = "pkill -f stress-ng"
                self.run_ssh_command(node_ip, kill_cmd)
                
                # 로컬 프로세스 종료
                process.terminate()
                process.wait(timeout=5)
                print(f"✅ {isolation_type} 격리 중지됨: {node_ip}")
            except Exception as e:
                print(f"❌ 격리 중지 실패: {node_ip} - {e}")
        
        self.isolation_processes.clear()

def main():
    parser = argparse.ArgumentParser(description="쿠버네티스 노드 격리 테스트")
    parser.add_argument("--node", required=True, help="격리할 노드명 (예: worker1)")
    parser.add_argument("--method", 
                       choices=["network", "kubelet", "runtime", "drain", "extreme"], 
                       default="network",
                       help="격리 방법")
    parser.add_argument("--duration", type=int, default=300, help="격리 지속 시간 (초)")
    
    args = parser.parse_args()
    
    isolation = NodeIsolation()
    
    try:
        success = isolation.isolate_node(args.node, args.method, args.duration)
        
        if success:
            print(f"\n✅ 노드 격리가 시작되었습니다: {args.node}")
            print(f"⏳ {args.duration}초 동안 격리가 유지됩니다...")
            print("Ctrl+C를 눌러 중지할 수 있습니다.")
            
            # 격리 시간 동안 대기
            time.sleep(args.duration)
            print("\n✅ 격리 시간이 완료되었습니다.")
        else:
            print(f"\n❌ 노드 격리 실패: {args.node}")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n사용자에 의해 중단됨")
    finally:
        isolation.stop_isolation()

if __name__ == "__main__":
    main() 