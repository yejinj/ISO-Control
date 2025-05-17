#!/bin/bash

# 새 네트워크 정보
NEW_NETWORK="192.168.2.0/24"  # 새 네트워크 대역
NEW_MASTER_IPS=("192.168.2.6" "192.168.2.7" "192.168.2.8")  # 새 마스터 노드 IP들

# 1. 현재 클러스터 상태 백업
echo "Backing up current cluster state..."
kubectl get all --all-namespaces -o yaml > cluster-backup.yaml
kubectl get pv,pvc --all-namespaces -o yaml > storage-backup.yaml

# 2. 새 네트워크 설정 파일 생성
echo "Creating new network configuration..."
cat > k8s/new-network-config.yaml << EOF
apiVersion: kubeadm.k8s.io/v1beta3
kind: ClusterConfiguration
kubernetesVersion: v1.29.2
controlPlaneEndpoint: "${NEW_MASTER_IPS[0]}:6443"
etcd:
  external:
    endpoints:
    - "https://${NEW_MASTER_IPS[0]}:2379"
    - "https://${NEW_MASTER_IPS[1]}:2379"
    - "https://${NEW_MASTER_IPS[2]}:2379"
    caFile: /etc/kubernetes/pki/etcd/ca.crt
    certFile: /etc/kubernetes/pki/etcd/server.crt
    keyFile: /etc/kubernetes/pki/etcd/server.key
networking:
  podSubnet: "10.244.0.0/16"
  serviceSubnet: "10.96.0.0/12"
---
apiVersion: kubeadm.k8s.io/v1beta3
kind: InitConfiguration
localAPIEndpoint:
  advertiseAddress: "${NEW_MASTER_IPS[0]}"
  bindPort: 6443
nodeRegistration:
  criSocket: "unix:///run/containerd/containerd.sock"
---
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
cgroupDriver: systemd
EOF

# 3. 새 HAProxy 설정 생성
echo "Creating new HAProxy configuration..."
cat > k8s/new-haproxy.cfg << EOF
global
    daemon
    maxconn 4096

defaults
    mode tcp
    timeout connect 5000
    timeout client 50000
    timeout server 50000

frontend kubernetes-frontend
    bind *:6443
    mode tcp
    option tcplog
    default_backend kubernetes-backend

backend kubernetes-backend
    mode tcp
    option tcp-check
    balance roundrobin
    server k8s-master-1 ${NEW_MASTER_IPS[0]}:6443 check fall 3 rise 2
    server k8s-master-2 ${NEW_MASTER_IPS[1]}:6443 check fall 3 rise 2
    server k8s-master-3 ${NEW_MASTER_IPS[2]}:6443 check fall 3 rise 2
EOF

# 4. 새 마스터 노드 설정
echo "Configuring new master nodes..."
for i in "${!NEW_MASTER_IPS[@]}"; do
    echo "Setting up master node ${NEW_MASTER_IPS[$i]}..."
    # 여기에 새 마스터 노드 설정 명령어 추가
    # 예: ssh root@${NEW_MASTER_IPS[$i]} "kubeadm init --config k8s/new-network-config.yaml"
done

# 5. 워크로드 마이그레이션 준비
echo "Preparing workload migration..."
kubectl get nodes -o wide
kubectl get pods --all-namespaces -o wide

echo "Migration preparation completed."
echo "Next steps:"
echo "1. Configure new network on all nodes"
echo "2. Update DNS and routing if necessary"
echo "3. Migrate workloads to new nodes"
echo "4. Verify cluster health with: kubectl get nodes" 