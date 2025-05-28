import React from 'react';
import { PodDistribution as PodDistributionType } from '../types/api';
import { Package, Server } from 'lucide-react';

interface PodDistributionProps {
  distributions: PodDistributionType[];
}

const PodDistribution: React.FC<PodDistributionProps> = ({ distributions }) => {
  const totalPods = distributions.reduce((sum, dist) => sum + dist.pod_count, 0);

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">파드 분포</h3>
        <p className="text-sm text-gray-600 mb-6">
          각 노드별 파드 분포 현황을 확인할 수 있습니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {distributions.map((dist) => (
            <div key={dist.node_name} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Server className="w-5 h-5 text-gray-400" />
                  <h4 className="font-medium text-gray-900">{dist.node_name}</h4>
                </div>
                <span className="text-sm text-gray-600">
                  {dist.ready_count}/{dist.pod_count}
                </span>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>실행 중</span>
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

              <div className="space-y-2">
                {dist.pods.slice(0, 3).map((pod) => (
                  <div key={pod.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Package className="w-3 h-3 text-gray-400" />
                      <span className="truncate">{pod.name}</span>
                    </div>
                    <span className={`status-badge ${
                      pod.status === 'Running' ? 'status-ready' : 
                      pod.status === 'Failed' ? 'status-not-ready' : 'status-unknown'
                    }`}>
                      {pod.status}
                    </span>
                  </div>
                ))}
                {dist.pods.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dist.pods.length - 3}개 더
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PodDistribution; 