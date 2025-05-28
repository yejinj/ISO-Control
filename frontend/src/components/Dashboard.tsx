import React, { useState, useEffect } from 'react';
import { Activity, Server, Package, AlertTriangle, CheckCircle, Clock, Play, Square } from 'lucide-react';

interface ClusterStats {
  totalNodes: number;
  readyNodes: number;
  totalPods: number;
  runningPods: number;
}

interface NodeStatus {
  name: string;
  status: 'Ready' | 'NotReady' | 'Unknown';
  pods: number;
  cpu: string;
  memory: string;
}

interface IsolationTask {
  id: string;
  nodeName: string;
  method: string;
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  duration: number;
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [clusterStats, setClusterStats] = useState<ClusterStats>({
    totalNodes: 5,
    readyNodes: 5,
    totalPods: 12,
    runningPods: 12
  });
  
  const [nodes, setNodes] = useState<NodeStatus[]>([
    { name: 'isc-master1', status: 'Ready', pods: 8, cpu: '15%', memory: '45%' },
    { name: 'isc-master2', status: 'Ready', pods: 7, cpu: '12%', memory: '38%' },
    { name: 'isc-master3', status: 'Ready', pods: 6, cpu: '18%', memory: '42%' },
    { name: 'isc-worker1', status: 'Ready', pods: 3, cpu: '25%', memory: '55%' },
    { name: 'isc-worker2', status: 'Ready', pods: 3, cpu: '22%', memory: '48%' }
  ]);

  const [isolationTasks, setIsolationTasks] = useState<IsolationTask[]>([]);
  const [selectedNode, setSelectedNode] = useState('isc-worker1');
  const [selectedMethod, setSelectedMethod] = useState('kubelet_stop');
  const [duration, setDuration] = useState(120);

  const isolationMethods = [
    { value: 'network_isolation', label: '네트워크 격리', description: 'API 서버 통신 차단' },
    { value: 'kubelet_stop', label: 'Kubelet 중지', description: 'kubelet 서비스 중지' },
    { value: 'container_runtime_stop', label: '컨테이너 런타임 중지', description: 'containerd/docker 중지' },
    { value: 'node_drain_manual', label: '수동 드레인', description: '파드 강제 삭제' },
    { value: 'extreme_resource_exhaustion', label: '리소스 고갈', description: '메모리 99% 사용' }
  ];

  const startIsolation = () => {
    const newTask: IsolationTask = {
      id: `task-${Date.now()}`,
      nodeName: selectedNode,
      method: selectedMethod,
      status: 'running',
      startTime: new Date().toISOString(),
      duration: duration
    };
    
    setIsolationTasks(prev => [...prev, newTask]);
    
    // 시뮬레이션: duration 후 완료 처리
    setTimeout(() => {
      setIsolationTasks(prev => 
        prev.map(task => 
          task.id === newTask.id 
            ? { ...task, status: 'completed' }
            : task
        )
      );
    }, duration * 1000);
  };

  const stopIsolation = (taskId: string) => {
    setIsolationTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'completed' }
          : task
      )
    );
  };

  const tabs = [
    { id: 'overview', label: '클러스터 개요', icon: Activity },
    { id: 'isolation', label: '노드 격리', icon: Server },
    { id: 'monitoring', label: '실시간 모니터링', icon: Package }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Cluster Node Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            노드 격리 및 파드 마이그레이션 모니터링 시스템
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 클러스터 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Server className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        총 노드
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {clusterStats.totalNodes}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Ready 노드
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {clusterStats.readyNodes}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Package className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        총 파드
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {clusterStats.totalPods}
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
                        실행 중 파드
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {clusterStats.runningPods}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* 노드 상태 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  노드 상태
                </h3>
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          노드명
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          상태
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          파드 수
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CPU 사용률
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          메모리 사용률
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {nodes.map((node) => (
                        <tr key={node.name}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {node.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              node.status === 'Ready' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {node.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {node.pods}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {node.cpu}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {node.memory}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'isolation' && (
          <div className="space-y-6">
            {/* 격리 제어 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  노드 격리 제어
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      대상 노드
                    </label>
                    <select
                      value={selectedNode}
                      onChange={(e) => setSelectedNode(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {nodes.filter(node => node.name.includes('worker')).map((node) => (
                        <option key={node.name} value={node.name}>
                          {node.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      격리 방법
                    </label>
                    <select
                      value={selectedMethod}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {isolationMethods.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      지속 시간 (초)
                    </label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      min="30"
                      max="600"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    {isolationMethods.find(m => m.value === selectedMethod)?.description}
                  </p>
                </div>

                <button
                  onClick={startIsolation}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Play className="w-4 h-4 mr-2" />
                  격리 시작
                </button>
              </div>
            </div>

            {/* 활성 격리 작업 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  활성 격리 작업
                </h3>
                
                {isolationTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    현재 실행 중인 격리 작업이 없습니다.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {isolationTasks.map((task) => (
                      <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-3 h-3 rounded-full ${
                              task.status === 'running' ? 'bg-yellow-400' :
                              task.status === 'completed' ? 'bg-green-400' : 'bg-red-400'
                            }`}></div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {task.nodeName} - {isolationMethods.find(m => m.value === task.method)?.label}
                              </p>
                              <p className="text-sm text-gray-500">
                                시작: {new Date(task.startTime).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              task.status === 'running' ? 'bg-yellow-100 text-yellow-800' :
                              task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {task.status === 'running' ? '실행 중' :
                               task.status === 'completed' ? '완료' : '실패'}
                            </span>
                            {task.status === 'running' && (
                              <button
                                onClick={() => stopIsolation(task.id)}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                              >
                                <Square className="w-3 h-3 mr-1" />
                                중지
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  실시간 모니터링
                </h3>
                <p className="text-gray-600 mb-4">
                  파드 마이그레이션 및 클러스터 상태를 실시간으로 모니터링합니다.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      마지막 업데이트: {new Date().toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-700">
                    <p>• 모든 노드가 정상 상태입니다.</p>
                    <p>• 파드 마이그레이션 이벤트가 감지되지 않았습니다.</p>
                    <p>• 클러스터 리소스 사용률이 정상 범위 내에 있습니다.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 