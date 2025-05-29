#!/usr/bin/env python3
"""
최소한의 HTTP 서버 (개발/테스트용)
"""

import http.server
import socketserver
import json
from datetime import datetime
from urllib.parse import urlparse, parse_qs

class APIHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/v1/monitoring/cluster':
            self.send_cluster_status()
        elif parsed_path.path == '/api/v1/monitoring/events':
            self.send_monitoring_events()
        else:
            self.send_error(404, "Not Found")
    
    def do_POST(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/v1/isolation/start':
            self.handle_isolation_start()
        else:
            self.send_error(404, "Not Found")
    
    def send_cluster_status(self):
        data = {
            "timestamp": datetime.now().isoformat(),
            "nodes": [
                {"name": "isc-master1", "status": "Ready", "pods": 8, "cpu": "15%", "memory": "45%"},
                {"name": "isc-master2", "status": "Ready", "pods": 7, "cpu": "12%", "memory": "38%"},
                {"name": "isc-master3", "status": "Ready", "pods": 6, "cpu": "18%", "memory": "42%"},
                {"name": "isc-worker1", "status": "Ready", "pods": 3, "cpu": "25%", "memory": "55%"},
                {"name": "isc-worker2", "status": "Ready", "pods": 3, "cpu": "22%", "memory": "48%"}
            ],
            "pod_distribution": [
                {"node_name": "isc-worker1", "pod_count": 3, "ready_count": 3},
                {"node_name": "isc-worker2", "pod_count": 3, "ready_count": 3}
            ],
            "total_nodes": 5,
            "ready_nodes": 5,
            "total_pods": 27,
            "running_pods": 27
        }
        self.send_json_response(data)
    
    def send_monitoring_events(self):
        data = {
            "events": [
                {
                    "timestamp": datetime.now().isoformat(),
                    "event_type": "info",
                    "message": "클러스터 상태 정상",
                    "node_name": None,
                    "pod_name": None
                }
            ]
        }
        self.send_json_response(data)
    
    def handle_isolation_start(self):
        data = {
            "task_id": f"task-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "status": "started",
            "message": "격리 작업이 시작되었습니다"
        }
        self.send_json_response(data)
    
    def send_json_response(self, data):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == "__main__":
    PORT = 8000
    with socketserver.TCPServer(("", PORT), APIHandler) as httpd:
        print(f"🚀 최소 HTTP 서버 시작 - http://localhost:{PORT}")
        httpd.serve_forever() 