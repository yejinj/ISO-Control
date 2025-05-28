import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { NodeInfo } from '../types/api';
import { nodeApi } from '../services/api';
import { Server, Play, Pause, Download } from 'lucide-react';

interface NodeListProps {
  nodes: NodeInfo[];
}

const NodeList: React.FC<NodeListProps> = ({ nodes }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const cordonMutation = useMutation(nodeApi.cordonNode, {
    onSuccess: () => {
      queryClient.invalidateQueries('monitoring-data');
      alert('노드가 성공적으로 cordon되었습니다.');
    },
    onError: (error: any) => {
      alert(`Cordon 실패: ${error.response?.data?.detail || error.message}`);
    },
  });

  const uncordonMutation = useMutation(nodeApi.uncordonNode, {
    onSuccess: () => {
      queryClient.invalidateQueries('monitoring-data');
      alert('노드가 성공적으로 uncordon되었습니다.');
    },
    onError: (error: any) => {
      alert(`Uncordon 실패: ${error.response?.data?.detail || error.message}`);
    },
  });

  const drainMutation = useMutation(nodeApi.drainNode, {
    onSuccess: () => {
      queryClient.invalidateQueries('monitoring-data');
      alert('노드가 성공적으로 drain되었습니다.');
    },
    onError: (error: any) => {
      alert(`Drain 실패: ${error.response?.data?.detail || error.message}`);
    },
  });

  const handleCordon = (nodeName: string) => {
    if (confirm(`${nodeName} 노드를 cordon하시겠습니까?`)) {
      cordonMutation.mutate(nodeName);
    }
  };

  const handleUncordon = (nodeName: string) => {
    if (confirm(`${nodeName} 노드를 uncordon하시겠습니까?`)) {
      uncordonMutation.mutate(nodeName);
    }
  };

  const handleDrain = (nodeName: string) => {
    if (confirm(`${nodeName} 노드를 drain하시겠습니까? 모든 파드가 다른 노드로 이동됩니다.`)) {
      drainMutation.mutate(nodeName);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">노드 관리</h3>
        <p className="text-sm text-gray-600 mb-6">
          클러스터의 모든 노드를 관리하고 제어할 수 있습니다.
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  노드
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  역할
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  버전
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  내부 IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {nodes.map((node) => (
                <tr key={node.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Server className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {node.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {node.os_image}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`status-badge ${
                      node.status === 'Ready' ? 'status-ready' : 
                      node.status === 'NotReady' ? 'status-not-ready' : 'status-unknown'
                    }`}>
                      {node.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {node.roles.join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {node.version}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {node.internal_ip}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCordon(node.name)}
                        disabled={cordonMutation.isLoading}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Pause className="w-3 h-3 mr-1" />
                        Cordon
                      </button>
                      <button
                        onClick={() => handleUncordon(node.name)}
                        disabled={uncordonMutation.isLoading}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Uncordon
                      </button>
                      <button
                        onClick={() => handleDrain(node.name)}
                        disabled={drainMutation.isLoading}
                        className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Drain
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 노드 상세 정보 */}
      {selectedNode && (
        <div className="card">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            노드 상세 정보: {selectedNode}
          </h4>
          {/* 여기에 선택된 노드의 상세 정보를 표시 */}
        </div>
      )}
    </div>
  );
};

export default NodeList; 