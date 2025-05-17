#!/bin/bash

# 현재 클러스터 상태 백업
echo "Backing up current cluster state..."
kubectl get all --all-namespaces -o yaml > cluster-backup.yaml
kubectl get pv,pvc --all-namespaces -o yaml > storage-backup.yaml

# HAProxy 설치 및 설정
echo "Installing and configuring HAProxy..."
apt-get update
apt-get install -y haproxy
cp k8s/haproxy.cfg /etc/haproxy/haproxy.cfg
systemctl restart haproxy

# 현재 마스터 노드 설정 업데이트
echo "Updating current master node configuration..."
kubeadm init phase upload-config kubeadm --config k8s/ha-cluster-config.yaml
kubeadm init phase upload-certs --upload-certs

# 새 마스터 노드 추가를 위한 join 명령어 생성
echo "Generating join command for new master nodes..."
JOIN_CMD=$(kubeadm token create --print-join-command)
echo "Join command for new master nodes: $JOIN_CMD"

# 현재 실행 중인 워크로드 확인
echo "Current running workloads:"
kubectl get pods --all-namespaces

echo "Migration preparation completed. Please proceed with adding new master nodes using the join command above."
echo "After adding new master nodes, verify cluster health with: kubectl get nodes" 