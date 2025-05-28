import React, { useState, useEffect } from 'react';
import { Package, Server, Activity, RefreshCw } from 'lucide-react';

interface PodInfo {
  name: string;
  namespace: string;
  status: 'Running' | 'Pending' | 'Failed' | 'Terminating';
  restarts: number;
}

interface NodePodDistribution {
  nodeName: string;
  totalPods: number;
  runningPods: number;
  pendingPods: number;
  failedPods: number;
  pods: PodInfo[];
}

const PodDistribution: React.FC = () => {
  const [distributions, setDistributions] = useState<NodePodDistribution[]>([
    {
      nodeName: 'isc-master1',
      totalPods: 8,
      runningPods: 8,
      pendingPods: 0,
      failedPods: 0,
      pods: [
        { name: 'kube-apiserver-master1', namespace: 'kube-system', status: 'Running', restarts: 0 },
        { name: 'kube-controller-manager-master1', namespace: 'kube-system', status: 'Running', restarts: 0 },
        { name: 'kube-scheduler-master1', namespace: 'kube-system', status: 'Running', restarts: 0 },
        { name: 'etcd-master1', namespace: 'kube-system', status: 'Running', restarts: 0 },
        { name: 'coredns-1', namespace: 'kube-system', status: 'Running', restarts: 0 },
        { name: 'calico-node-1', namespace: 'kube-system', status: 'Running', restarts: 0 },
        { name: 'kube-proxy-1', namespace: 'kube-system', status: 'Running', restarts: 0 },
        { name: 'metrics-server-1', namespace: 'kube-system', status: 'Running', restarts: 0 }
      ]
    },
    {
      nodeName: 'isc-master2',
      totalPods: 7,
      runningPods: 7,
      pendingPods: 0,
      failedPods: 0,
      pods: [
        { name: 'kube-apiserver-master2', namespace: 'kube-system', status: 'Running', restarts: 0 },
        { name: 'kube-controller-manager-master2', namespace: 'kube-system', status: 'Running', restarts: 0 },
        { name: 'kube-scheduler-master2', namespace: 'kube-system', status: 'Running', restarts: 0 },
        { name: 'etcd-master2', namespace: 'kube-system', status: 'Running', restarts: 0 },
        { name: 'coredns-2', namespace: 'kube-system', status: 'Running', restarts: 0 },
        { name: 'calico-node-2', namespace: 'kube-system', status: 'Running', restarts: 0 },
        { name: 'kube-proxy-2', namespace: 'kube-system', status: 'Running', restarts: 0 }
      ]
    },
    {
      nodeName: 'isc-master3',
      totalPods: 6,
      runningPods: 6,
      pendingPods: 0,
      failedPods: 0,
      pods: [
        { name: 'kube-apiserver-master3', namespace: 'kube-system', status: 'Running', restarts: 0 },
        { name: 'kube-controller-manager-master3', namespace: 'kube-system', status: 'Running', restarts: 0 },
        { name: 'kube-scheduler-master3', namespace: 'kube-system', status: 'Running', restarts: 0 },
        { name: 'etcd-master3', namespace: 'kube-system', status: 'Running', restarts: 0 },
        { name: 'calico-node-3', namespace: 'kube-system', status: 'Running', restarts: 0 },
        { name: 'kube-proxy-3', namespace: 'kube-system', status: 'Running', restarts: 0 }
      ]
    },
    {
      nodeName: 'isc-worker1',
      totalPods: 3,
      runningPods: 3,
      pendingPods: 0,
      failedPods: 0,
      pods: [
        { name: 'nginx-test-deployment-1', namespace: 'default', status: 'Running', restarts: 0 },
        { name: 'nginx-test-deployment-2', namespace: 'default', status: 'Running', restarts: 0 },
        { name: 'nginx-test-deployment-3', namespace: 'default', status: 'Running', restarts: 0 }
      ]
    },
    {
      nodeName: 'isc-worker2',
      totalPods: 3,
      runningPods: 3,
      pendingPods: 0,
      failedPods: 0,
      pods: [
        { name: 'nginx-test-deployment-4', namespace: 'default', status: 'Running', restarts: 0 },
        { name: 'nginx-test-deployment-5', namespace: 'default', status: 'Running', restarts: 0 },
        { name: 'nginx-test-deployment-6', namespace: 'default', status: 'Running', restarts: 0 }
      ]
    }
  ]);

  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    // 시뮬레이션: 데이터 새로고침
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Running':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      case 'Terminating':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPods = distributions.reduce((sum, dist) => sum + dist.totalPods, 0);
  const totalRunning = distributions.reduce((sum, dist) => sum + dist.runningPods, 0);

  return (
    <div className="space-y-6">
      {/* 요약 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  총 파드
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {totalPods}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  실행 중
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {totalRunning}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Server className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  활성 노드
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {distributions.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <RefreshCw className={`h-8 w-8 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  마지막 업데이트
                </dt>
                <dd className="text-sm font-medium text-gray-900">
                  {lastUpdate.toLocaleTimeString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* 파드 분포 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              노드별 파드 분포
            </h3>
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              새로고침
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {distributions.map((dist) => (
              <div key={dist.nodeName} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Server className="w-5 h-5 text-gray-400" />
                    <h4 className="font-medium text-gray-900">{dist.nodeName}</h4>
                  </div>
                  <div className="text-sm text-gray-600">
                    {dist.runningPods}/{dist.totalPods} 실행 중
                  </div>
                </div>

                {/* 진행률 바 */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>파드 상태</span>
                    <span>{Math.round((dist.runningPods / dist.totalPods) * 100) || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${dist.totalPods > 0 ? (dist.runningPods / dist.totalPods) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>

                {/* 파드 목록 */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {dist.pods.map((pod) => (
                    <div key={pod.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <Package className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="truncate font-medium">{pod.name}</span>
                        <span className="text-gray-500 text-xs">({pod.namespace})</span>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {pod.restarts > 0 && (
                          <span className="text-xs text-orange-600">
                            재시작: {pod.restarts}
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pod.status)}`}>
                          {pod.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodDistribution; 