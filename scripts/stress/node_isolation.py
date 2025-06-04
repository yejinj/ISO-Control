#!/usr/bin/env python3
"""
노드 격리 스크립트
"""

import os
import sys
import time
import argparse
import subprocess
from pathlib import Path

# 프로젝트 루트 디렉토리 추가
project_root = Path(__file__).parent.parent.parent
sys.path.append(str(project_root))

from tools.env_loader import EnvLoader

def run_command(cmd, node):
    """원격 노드에서 명령어 실행"""
    env = EnvLoader(str(project_root / "config" / "env.yaml"))
    node_info = env.get_node_by_name(node)
    
    if not node_info:
        raise ValueError(f"노드를 찾을 수 없습니다: {node}")
    
    ssh_cmd = [
        "sshpass",
        "-p", env.config['ssh']['password'],
        "ssh",
        "-o", "StrictHostKeyChecking=no",
        "-p", str(env.config['ssh']['port']),
        f"{env.config['ssh']['user']}@{node_info['private_ip']}",
        cmd
    ]
    
    print(f"실행: {' '.join(ssh_cmd)}")
    return subprocess.run(ssh_cmd, capture_output=True, text=True)

def isolate_node(node, method, duration):
    """노드 격리 실행"""
    print(f"{node}번째 노드 격리 시작..")
    print(f"격리 방법: {method}")
    print(f"지속 시간: {duration}초")
    
    try:
        if method == "network":
            # iptables로 API 서버 통신 차단
            cmd = "iptables -A OUTPUT -p tcp --dport 6443 -j DROP && echo '네트워크 격리 완료'"
            result = run_command(cmd, node)
            if result.returncode != 0:
                raise Exception(f"네트워크 격리 실패: {result.stderr}")
            
            # 지정된 시간 후 복구
            time.sleep(duration)
            cmd = "iptables -D OUTPUT -p tcp --dport 6443 -j DROP && echo '네트워크 복구 완료'"
            result = run_command(cmd, node)
            if result.returncode != 0:
                raise Exception(f"네트워크 복구 실패: {result.stderr}")
            
        elif method == "kubelet":
            # kubelet 서비스 중지
            cmd = "systemctl stop kubelet && echo 'kubelet 중지 완료'"
            result = run_command(cmd, node)
            if result.returncode != 0:
                raise Exception(f"kubelet 중지 실패: {result.stderr}")
            
            # 지정된 시간 후 복구
            time.sleep(duration)
            cmd = "systemctl start kubelet && echo 'kubelet 시작 완료'"
            result = run_command(cmd, node)
            if result.returncode != 0:
                raise Exception(f"kubelet 시작 실패: {result.stderr}")
            
        elif method == "runtime":
            # 컨테이너 런타임 중지
            cmd = "systemctl stop containerd && echo '런타임 중지 완료'"
            result = run_command(cmd, node)
            if result.returncode != 0:
                raise Exception(f"런타임 중지 실패: {result.stderr}")
            
            # 지정된 시간 후 복구
            time.sleep(duration)
            cmd = "systemctl start containerd && echo '런타임 시작 완료'"
            result = run_command(cmd, node)
            if result.returncode != 0:
                raise Exception(f"런타임 시작 실패: {result.stderr}")
            
        elif method == "drain":
            # 노드 드레인
            cmd = f"kubectl drain {node} --ignore-daemonsets --delete-emptydir-data --force --grace-period=0 --timeout=60s && echo '노드 드레인 완료'"
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            if result.returncode != 0:
                raise Exception(f"노드 드레인 실패: {result.stderr}")
            
            # 지정된 시간 후 복구
            time.sleep(duration)
            cmd = f"kubectl uncordon {node} && echo '노드 복구 완료'"
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            if result.returncode != 0:
                raise Exception(f"노드 복구 실패: {result.stderr}")
            
        elif method == "extreme":
            # stress-ng 설치 확인 및 설치
            cmd = "which stress-ng || apt-get update && apt-get install -y stress-ng"
            result = run_command(cmd, node)
            if result.returncode != 0:
                raise Exception(f"stress-ng 설치 실패: {result.stderr}")
            
            # CPU와 메모리 부하 생성
            cmd = "stress-ng --cpu 4 --vm 2 --vm-bytes 1G --timeout 10s && echo '부하 생성 완료'"
            result = run_command(cmd, node)
            if result.returncode != 0:
                raise Exception(f"부하 생성 실패: {result.stderr}")
            
        else:
            raise ValueError(f"지원하지 않는 격리 방법: {method}")
        
        print("격리가 완료되었습니다.")
        
    except Exception as e:
        print(f"{str(e)} 격리를 실패하였습니다.")
        raise

def main():
    parser = argparse.ArgumentParser(description="노드 격리 스크립트")
    parser.add_argument("--node", required=True, help="격리할 노드 이름")
    parser.add_argument("--method", required=True, choices=["network", "kubelet", "runtime", "drain", "extreme"], help="격리 방법")
    parser.add_argument("--duration", type=int, default=300, help="격리 지속 시간(초)")
    
    args = parser.parse_args()
    
    try:
        isolate_node(args.node, args.method, args.duration)
    except Exception as e:
        print(f"격리 작업 중 오류 발생: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 