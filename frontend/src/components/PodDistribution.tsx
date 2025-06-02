import React from 'react';
import { Package, Activity, Server, RefreshCw } from 'lucide-react';
import { useRefresh } from '../contexts/RefreshContext';
import { PodDistribution as PodDistributionType } from '../types';

interface PodDistributionProps {
  podDistribution: PodDistributionType[];
}

const PodDistribution: React.FC<PodDistributionProps> = ({ podDistribution }) => {
  const { isRefreshing, lastUpdate, refreshAll } = useRefresh();

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

  if (!podDistribution || podDistribution.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">파드 데이터가 없습니다.</div>
      </div>
    );
  }

  const totalPods = podDistribution.reduce((sum, dist) => sum + dist.pod_count, 0);
  const runningPods = podDistribution.reduce((sum, dist) => sum + dist.ready_count, 0);
  const activeNodes = podDistribution.length;

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
                  {runningPods}
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
                  {activeNodes}
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
              onClick={() => refreshAll()}
              disabled={isRefreshing}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              새로고침
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {podDistribution.map((dist) => (
              <div key={dist.node_name} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Server className="w-5 h-5 text-gray-400" />
                    <h4 className="font-medium text-gray-900">{dist.node_name}</h4>
                  </div>
                  <div className="text-sm text-gray-600">
                    {dist.ready_count}/{dist.pod_count} 실행 중
                  </div>
                </div>

                {/* 진행률 바 */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>파드 상태</span>
                    <span>{Math.round((dist.ready_count / dist.pod_count) * 100) || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${dist.pod_count > 0 ? (dist.ready_count / dist.pod_count) * 100 : 0}%`
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
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-500">{pod.namespace}</span>
                        <span className="text-gray-500">재시작: {pod.restarts}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(pod.status)}`}>
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