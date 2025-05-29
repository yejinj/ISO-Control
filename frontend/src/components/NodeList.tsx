import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { nodeApi } from '../services/api';
import { Server, Play, Pause, Download, Shield } from 'lucide-react';
import { Node } from '../types';

interface NodeListProps {
  nodes: Node[];
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

  const handleCordon = async (nodeName: string) => {
    if (!isWorkerNode(nodeName)) {
      alert('워커 노드만 Cordon할 수 있습니다.');
      return;
    }

    if (!confirm(`${nodeName} 노드를 스케줄링 불가 상태로 변경하시겠습니까?`)) {
      return;
    }

    try {
      await nodeApi.cordonNode(nodeName);
      queryClient.invalidateQueries('monitoring-data');
    } catch (error) {
      console.error('노드 cordon 오류:', error);
      alert('노드 cordon 중 오류가 발생했습니다.');
    }
  };

  const handleUncordon = async (nodeName: string) => {
    if (!isWorkerNode(nodeName)) {
      alert('워커 노드만 Uncordon할 수 있습니다.');
      return;
    }

    if (!confirm(`${nodeName} 노드의 스케줄링 불가 상태를 해제하시겠습니까?`)) {
      return;
    }

    try {
      await nodeApi.uncordonNode(nodeName);
      queryClient.invalidateQueries('monitoring-data');
    } catch (error) {
      console.error('노드 uncordon 오류:', error);
      alert('노드 uncordon 중 오류가 발생했습니다.');
    }
  };

  const handleDrain = async (nodeName: string) => {
    if (!isWorkerNode(nodeName)) {
      alert('워커 노드만 Drain할 수 있습니다.');
      return;
    }

    if (!confirm(`${nodeName} 노드의 모든 파드를 다른 노드로 이동하시겠습니까?`)) {
      return;
    }

    try {
      await nodeApi.drainNode(nodeName);
      queryClient.invalidateQueries('monitoring-data');
    } catch (error) {
      console.error('노드 drain 오류:', error);
      alert('노드 drain 중 오류가 발생했습니다.');
    }
  };

  const isWorkerNode = (nodeName: string): boolean => {
    return nodeName.includes('worker');
  };

  const getNodeIcon = (node: Node) => {
    if (node.roles.includes('control-plane')) {
      return <Shield className="w-5 h-5 text-blue-500 mr-3" />;
    }
    return <Server className="w-5 h-5 text-gray-400 mr-3" />;
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">노드 관리</h3>
        <p className="text-sm text-gray-600 mb-6">
          클러스터의 모든 노드를 관리하고 제어할 수 있습니다. (작업은 워커 노드만 가능)
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
                      {getNodeIcon(node)}
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
                    {isWorkerNode(node.name) ? (
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
                    ) : (
                      <span className="text-xs text-gray-500">컨트롤 플레인 노드</span>
                    )}
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