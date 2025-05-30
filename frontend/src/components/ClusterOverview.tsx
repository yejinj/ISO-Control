import React from 'react';
import { ClusterStatus } from '../types/api';
import { Server, Package, CheckCircle, AlertCircle } from 'lucide-react';

interface ClusterOverviewProps {
  clusterStatus?: ClusterStatus;
}

const ClusterOverview: React.FC<ClusterOverviewProps> = ({ clusterStatus }) => {
  if (!clusterStatus) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">클러스터 데이터를 불러오는 중...</div>
      </div>
    );
  }

  const stats = [
    {
      title: '전체 노드',
      value: clusterStatus.total_nodes || 0,
      icon: Server,
      color: 'blue',
    },
    {
      title: '준비된 노드',
      value: clusterStatus.ready_nodes || 0,
      icon: CheckCircle,
      color: 'green',
    },
    {
      title: '전체 파드',
      value: clusterStatus.total_pods || 0,
      icon: Package,
      color: 'purple',
    },
    {
      title: '실행 중인 파드',
      value: clusterStatus.running_pods || 0,
      icon: CheckCircle,
      color: 'green',
    },
  ];

  const getHealthStatus = () => {
    const totalNodes = clusterStatus.total_nodes || 0;
    const readyNodes = clusterStatus.ready_nodes || 0;
    const totalPods = clusterStatus.total_pods || 0;
    const runningPods = clusterStatus.running_pods || 0;
    
    const nodeHealth = totalNodes > 0 ? readyNodes / totalNodes : 0;
    const podHealth = totalPods > 0 ? runningPods / totalPods : 0;
    
    if (nodeHealth >= 0.8 && podHealth >= 0.8) {
      return { status: 'healthy', label: '정상', color: 'green' };
    } else if (nodeHealth >= 0.5 && podHealth >= 0.5) {
      return { status: 'warning', label: '주의', color: 'yellow' };
    } else {
      return { status: 'critical', label: '위험', color: 'red' };
    }
  };

  const health = getHealthStatus();

  return (
    <div className="space-y-6">
      {/* 클러스터 상태 헤더 */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">클러스터 상태</h3>
            <p className="text-sm text-gray-600">
              마지막 업데이트: {new Date(clusterStatus.timestamp).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {health.status === 'healthy' ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            )}
            <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${health.color}-100 text-${health.color}-800`}>
              {health.label}
            </span>
          </div>
        </div>
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 노드 상태 요약 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">노드 상태</h4>
          <div className="space-y-3">
            {clusterStatus.nodes?.map((node) => (
              <div key={node.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    node.status === 'Ready' ? 'bg-green-400' : 
                    node.status === 'NotReady' ? 'bg-red-400' : 'bg-gray-400'
                  }`}></div>
                  <span className="font-medium">{node.name}</span>
                  <span className="text-sm text-gray-500">
                    ({node.roles.join(', ')})
                  </span>
                </div>
                <span className={`status-badge ${
                  node.status === 'Ready' ? 'status-ready' : 
                  node.status === 'NotReady' ? 'status-not-ready' : 'status-unknown'
                }`}>
                  {node.status}
                </span>
              </div>
            )) || (
              <div className="text-center py-4 text-gray-500">
                노드 정보를 불러올 수 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 파드 분포 요약 */}
        <div className="card">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">파드 분포</h4>
          <div className="space-y-3">
            {clusterStatus.pod_distribution?.map((dist) => (
              <div key={dist.node_name} className="flex items-center justify-between">
                <span className="font-medium">{dist.node_name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {dist.ready_count}/{dist.pod_count}
                  </span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${dist.pod_count > 0 ? (dist.ready_count / dist.pod_count) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-4 text-gray-500">
                파드 분포 정보를 불러올 수 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClusterOverview; 