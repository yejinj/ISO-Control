#!/usr/bin/env python3
"""
환경변수 로더 유틸리티
YAML 파일에서 서버 정보를 읽어와 환경변수로 설정
"""

import yaml
import os
import sys
from pathlib import Path

class EnvLoader:
    def __init__(self, config_path="config/env.yaml"):
        self.config_path = Path(config_path)
        self.config = None
        self.load_config()
    
    def load_config(self):
        """YAML 설정 파일 로드"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as file:
                self.config = yaml.safe_load(file)
        except FileNotFoundError:
            print(f"설정 파일을 찾을 수 없습니다: {self.config_path}")
            sys.exit(1)
        except yaml.YAMLError as e:
            print(f"YAML 파일 파싱 오류: {e}")
            sys.exit(1)
    
    def get_all_nodes(self):
        """모든 노드 정보 반환"""
        nodes = {}
        
        # 마스터 노드 추가
        for name, info in self.config['masters'].items():
            nodes[info['hostname']] = info
        
        # 워커 노드 추가
        for name, info in self.config['workers'].items():
            nodes[info['hostname']] = info
        
        # 로드밸런서 추가
        nodes[self.config['loadbalancer']['hostname']] = self.config['loadbalancer']
        
        return nodes
    
    def get_masters(self):
        """마스터 노드 정보만 반환"""
        return self.config['masters']
    
    def get_workers(self):
        """워커 노드 정보만 반환"""
        return self.config['workers']
    
    def get_loadbalancer(self):
        """로드밸런서 정보 반환"""
        return self.config['loadbalancer']
    
    def get_node_by_name(self, node_name):
        """특정 노드 정보 반환"""
        all_nodes = self.get_all_nodes()
        for name, info in all_nodes.items():
            if info['hostname'] == node_name:
                return info
        return None
    
    def get_private_ips(self):
        """모든 노드의 비공인 IP 리스트 반환"""
        nodes = self.get_all_nodes()
        return [info['private_ip'] for info in nodes.values()]
    
    def get_public_ips(self):
        """모든 노드의 공인 IP 리스트 반환"""
        nodes = self.get_all_nodes()
        return [info['public_ip'] for info in nodes.values()]
    
    def export_env_vars(self):
        """환경변수로 내보내기"""
        env_vars = {}
        
        # 클러스터 정보
        env_vars['CLUSTER_NAME'] = self.config['cluster']['name']
        env_vars['CLUSTER_VERSION'] = self.config['cluster']['version']
        
        # 마스터 노드
        for i, (name, info) in enumerate(self.config['masters'].items(), 1):
            env_vars[f'MASTER{i}_HOSTNAME'] = info['hostname']
            env_vars[f'MASTER{i}_PRIVATE_IP'] = info['private_ip']
            env_vars[f'MASTER{i}_PUBLIC_IP'] = info['public_ip']
        
        # 워커 노드
        for i, (name, info) in enumerate(self.config['workers'].items(), 1):
            env_vars[f'WORKER{i}_HOSTNAME'] = info['hostname']
            env_vars[f'WORKER{i}_PRIVATE_IP'] = info['private_ip']
            env_vars[f'WORKER{i}_PUBLIC_IP'] = info['public_ip']
        
        # 로드밸런서
        lb_info = self.config['loadbalancer']
        env_vars['LB_HOSTNAME'] = lb_info['hostname']
        env_vars['LB_PRIVATE_IP'] = lb_info['private_ip']
        env_vars['LB_PUBLIC_IP'] = lb_info['public_ip']
        env_vars['LB_API_PORT'] = str(lb_info['api_server_port'])
        
        # 네트워크 설정
        network = self.config['network']
        env_vars['POD_CIDR'] = network['pod_cidr']
        env_vars['SERVICE_CIDR'] = network['service_cidr']
        env_vars['CLUSTER_DNS'] = network['cluster_dns']
        
        # SSH 설정
        ssh = self.config['ssh']
        env_vars['SSH_USER'] = ssh['user']
        env_vars['SSH_KEY_PATH'] = ssh['key_path']
        env_vars['SSH_PORT'] = str(ssh['port'])
        
        return env_vars
    
    def generate_bash_env(self, output_file="config/env.sh"):
        """Bash 환경변수 파일 생성"""
        env_vars = self.export_env_vars()
        
        with open(output_file, 'w') as f:
            f.write("#!/bin/bash\n")
            f.write("# 자동 생성된 환경변수 파일\n")
            f.write("# 수정하지 마세요. env.yaml을 수정하고 다시 생성하세요.\n\n")
            
            for key, value in env_vars.items():
                f.write(f'export {key}="{value}"\n')
        
        # 실행 권한 부여
        os.chmod(output_file, 0o755)
        print(f"환경변수 파일이 생성되었습니다: {output_file}")

if __name__ == "__main__":
    loader = EnvLoader()
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "generate":
            loader.generate_bash_env()
        elif sys.argv[1] == "list":
            nodes = loader.get_all_nodes()
            print("=== 클러스터 노드 정보 ===")
            for name, info in nodes.items():
                print(f"{name}: {info['private_ip']} ({info['public_ip']})")
    else:
        print("사용법: python env_loader.py [generate|list]")
        print("  generate: Bash 환경변수 파일 생성")
        print("  list: 노드 정보 출력") 