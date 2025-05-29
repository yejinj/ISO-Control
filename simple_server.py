#!/usr/bin/env python3
"""
간단한 개발용 백엔드 서버
"""

from flask import Flask, jsonify
from flask_cors import CORS
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# 샘플 데이터
SAMPLE_CLUSTER_STATUS = {
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

@app.route('/api/v1/monitoring/cluster', methods=['GET'])
def get_cluster_status():
    return jsonify(SAMPLE_CLUSTER_STATUS)

@app.route('/api/v1/monitoring/events', methods=['GET'])
def get_monitoring_events():
    events = [
        {
            "timestamp": datetime.now().isoformat(),
            "event_type": "info",
            "message": "클러스터 상태 정상",
            "node_name": None,
            "pod_name": None
        }
    ]
    return jsonify({"events": events})

@app.route('/api/v1/isolation/start', methods=['POST'])
def start_isolation():
    return jsonify({
        "task_id": "task-123",
        "status": "started",
        "message": "격리 작업이 시작되었습니다."
    })

if __name__ == '__main__':
    print("🚀 개발용 백엔드 서버 시작 - http://localhost:8000")
    app.run(host='0.0.0.0', port=8000, debug=True) 