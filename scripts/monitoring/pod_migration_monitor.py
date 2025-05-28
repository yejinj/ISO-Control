#!/usr/bin/env python3
"""
파드 마이그레이션 모니터링 스크립트
노드 장애 시 파드가 다른 노드로 이동하는 과정을 실시간 추적
"""

import subprocess
import time
import json
import sys
import argparse
import threading
from datetime import datetime
from pathlib import Path
from collections import defaultdict

# 프로젝트 루트 디렉토리를 Python 경로에 추가
sys.path.append(str(Path(__file__).parent.parent.parent))
from tools.env_loader import EnvLoader

class PodMigrationMonitor:
    def __init__(self):
        self.env_loader = EnvLoader()
        self.monitoring_active = False
        self.pod_history = defaultdict(list)
        self.node_status = {}
        self.migration_events = []
    
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
        except subprocess.TimeoutExpired:
            print(f"kubectl 명령 타임아웃: {command}")
            return None
        except Exception as e:
            print(f"kubectl 명령 실행 오류: {e}")
            return None
    
    def get_all_pods(self, namespace="default"):
        """모든 파드 정보 조회"""
        cmd = f"get pods -n {namespace} -o json"
        result = self.run_kubectl_command(cmd)
        
        if not result or result.returncode != 0:
            print(f"파드 정보 조회 실패: {result.stderr if result else 'Unknown error'}")
            return []
        
        try:
            pods_data = json.loads(result.stdout)
            return pods_data.get('items', [])
        except json.JSONDecodeError as e:
            print(f"JSON 파싱 오류: {e}")
            return []
    
    def get_pod_info(self, pod):
        """파드 정보 추출"""
        metadata = pod.get('metadata', {})
        spec = pod.get('spec', {})
        status = pod.get('status', {})
        
        pod_info = {
            'name': metadata.get('name', 'Unknown'),
            'namespace': metadata.get('namespace', 'default'),
            'node': spec.get('nodeName', 'Unscheduled'),
            'phase': status.get('phase', 'Unknown'),
            'creation_time': metadata.get('creationTimestamp', ''),
            'restart_count': sum(
                container.get('restartCount', 0) 
                for container in status.get('containerStatuses', [])
            ),
            'ready': all(
                container.get('ready', False) 
                for container in status.get('containerStatuses', [])
            ),
            'conditions': status.get('conditions', [])
        }
        
        return pod_info
    
    def get_node_status(self):
        """모든 노드 상태 조회"""
        cmd = "get nodes -o json"
        result = self.run_kubectl_command(cmd)
        
        if not result or result.returncode != 0:
            print(f"노드 상태 조회 실패: {result.stderr if result else 'Unknown error'}")
            return {}
        
        try:
            nodes_data = json.loads(result.stdout)
            node_status = {}
            
            for node in nodes_data.get('items', []):
                name = node['metadata']['name']
                conditions = node.get('status', {}).get('conditions', [])
                
                # Ready 상태 확인
                ready_condition = next(
                    (c for c in conditions if c['type'] == 'Ready'), 
                    None
                )
                
                node_status[name] = {
                    'ready': ready_condition['status'] == 'True' if ready_condition else False,
                    'conditions': conditions,
                    'addresses': node.get('status', {}).get('addresses', [])
                }
            
            return node_status
        except json.JSONDecodeError as e:
            print(f"JSON 파싱 오류: {e}")
            return {}
    
    def detect_pod_migration(self, current_pods):
        """파드 마이그레이션 감지"""
        current_time = datetime.now()
        migrations = []
        
        for pod_info in current_pods:
            pod_name = pod_info['name']
            current_node = pod_info['node']
            
            # 이전 기록과 비교
            if pod_name in self.pod_history:
                last_record = self.pod_history[pod_name][-1]
                last_node = last_record['node']
                
                # 노드가 변경되었고, 둘 다 실제 노드인 경우 (Unscheduled 제외)
                if (current_node != last_node and 
                    current_node != 'Unscheduled' and 
                    last_node != 'Unscheduled'):
                    
                    migration = {
                        'pod_name': pod_name,
                        'namespace': pod_info['namespace'],
                        'from_node': last_node,
                        'to_node': current_node,
                        'timestamp': current_time,
                        'phase': pod_info['phase'],
                        'ready': pod_info['ready']
                    }
                    migrations.append(migration)
                    self.migration_events.append(migration)
            
            # 현재 상태 기록
            pod_record = {
                'timestamp': current_time,
                'node': current_node,
                'phase': pod_info['phase'],
                'ready': pod_info['ready'],
                'restart_count': pod_info['restart_count']
            }
            self.pod_history[pod_name].append(pod_record)
            
            # 기록 제한 (최근 100개만 유지)
            if len(self.pod_history[pod_name]) > 100:
                self.pod_history[pod_name] = self.pod_history[pod_name][-100:]
        
        return migrations
    
    def print_cluster_status(self, pods, nodes):
        """클러스터 상태 출력"""
        print("\n" + "="*80)
        print(f"클러스터 상태 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*80)
        
        # 노드 상태
        print("\n📊 노드 상태:")
        for node_name, status in nodes.items():
            status_icon = "✅" if status['ready'] else "❌"
            print(f"  {status_icon} {node_name}: {'Ready' if status['ready'] else 'NotReady'}")
        
        # 파드 분포
        print("\n📦 파드 분포:")
        pod_by_node = defaultdict(list)
        for pod in pods:
            node = pod['node']
            if node != 'Unscheduled':
                pod_by_node[node].append(pod)
        
        for node_name in sorted(pod_by_node.keys()):
            pods_on_node = pod_by_node[node_name]
            ready_count = sum(1 for p in pods_on_node if p['ready'])
            total_count = len(pods_on_node)
            
            print(f"  🖥️  {node_name}: {ready_count}/{total_count} 파드 Ready")
            for pod in pods_on_node:
                status_icon = "✅" if pod['ready'] else "❌"
                print(f"    {status_icon} {pod['name']} ({pod['phase']})")
        
        # 스케줄되지 않은 파드
        unscheduled_pods = [p for p in pods if p['node'] == 'Unscheduled']
        if unscheduled_pods:
            print(f"\n⏳ 스케줄되지 않은 파드: {len(unscheduled_pods)}개")
            for pod in unscheduled_pods:
                print(f"    ⏳ {pod['name']} ({pod['phase']})")
    
    def print_migration_events(self, migrations):
        """마이그레이션 이벤트 출력"""
        if migrations:
            print("\n🔄 파드 마이그레이션 감지:")
            for migration in migrations:
                timestamp = migration['timestamp'].strftime('%H:%M:%S')
                print(f"  [{timestamp}] {migration['pod_name']}: "
                      f"{migration['from_node']} → {migration['to_node']} "
                      f"({migration['phase']})")
    
    def monitor_loop(self, namespace="default", interval=10):
        """모니터링 메인 루프"""
        print(f"파드 마이그레이션 모니터링 시작 (네임스페이스: {namespace}, 간격: {interval}초)")
        print("Ctrl+C를 눌러 중지할 수 있습니다.\n")
        
        while self.monitoring_active:
            try:
                # 현재 상태 조회
                current_pods = [
                    self.get_pod_info(pod) 
                    for pod in self.get_all_pods(namespace)
                ]
                current_nodes = self.get_node_status()
                
                # 마이그레이션 감지
                migrations = self.detect_pod_migration(current_pods)
                
                # 상태 출력
                self.print_cluster_status(current_pods, current_nodes)
                self.print_migration_events(migrations)
                
                # 마이그레이션 통계
                if self.migration_events:
                    print(f"\n📈 총 마이그레이션 이벤트: {len(self.migration_events)}개")
                
                time.sleep(interval)
                
            except Exception as e:
                print(f"모니터링 오류: {e}")
                time.sleep(interval)
    
    def start_monitoring(self, namespace="default", interval=10):
        """백그라운드에서 모니터링 시작"""
        self.monitoring_active = True
        monitor_thread = threading.Thread(
            target=self.monitor_loop,
            args=(namespace, interval)
        )
        monitor_thread.daemon = True
        monitor_thread.start()
        return monitor_thread
    
    def stop_monitoring(self):
        """모니터링 중지"""
        self.monitoring_active = False
    
    def export_migration_report(self, output_file="migration_report.json"):
        """마이그레이션 리포트 내보내기"""
        report = {
            'total_migrations': len(self.migration_events),
            'migration_events': [
                {
                    'pod_name': event['pod_name'],
                    'namespace': event['namespace'],
                    'from_node': event['from_node'],
                    'to_node': event['to_node'],
                    'timestamp': event['timestamp'].isoformat(),
                    'phase': event['phase'],
                    'ready': event['ready']
                }
                for event in self.migration_events
            ],
            'generated_at': datetime.now().isoformat()
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"마이그레이션 리포트가 저장되었습니다: {output_file}")

def main():
    parser = argparse.ArgumentParser(description="쿠버네티스 파드 마이그레이션 모니터링")
    parser.add_argument("--namespace", default="default", help="모니터링할 네임스페이스")
    parser.add_argument("--interval", type=int, default=10, help="모니터링 간격 (초)")
    parser.add_argument("--output", help="마이그레이션 리포트 출력 파일")
    
    args = parser.parse_args()
    
    monitor = PodMigrationMonitor()
    
    try:
        monitor.monitoring_active = True
        monitor.monitor_loop(args.namespace, args.interval)
    except KeyboardInterrupt:
        print("\n모니터링이 중지되었습니다.")
    finally:
        monitor.stop_monitoring()
        
        if args.output:
            monitor.export_migration_report(args.output)
        
        # 요약 출력
        if monitor.migration_events:
            print(f"\n📊 모니터링 요약:")
            print(f"  - 총 마이그레이션 이벤트: {len(monitor.migration_events)}개")
            
            # 노드별 마이그레이션 통계
            from_nodes = defaultdict(int)
            to_nodes = defaultdict(int)
            
            for event in monitor.migration_events:
                from_nodes[event['from_node']] += 1
                to_nodes[event['to_node']] += 1
            
            if from_nodes:
                print("  - 마이그레이션 출발 노드:")
                for node, count in from_nodes.items():
                    print(f"    {node}: {count}개")
            
            if to_nodes:
                print("  - 마이그레이션 도착 노드:")
                for node, count in to_nodes.items():
                    print(f"    {node}: {count}개")

if __name__ == "__main__":
    main() 