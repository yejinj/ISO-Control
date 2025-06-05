import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { isolationApi, nodeApi } from '../services/api';
import { IsolationMethod, IsolationRequest, IsolationResponse, NodeList, Node } from '../types';
import { Play, Square, Clock, AlertTriangle } from 'lucide-react';

interface Task {
  task_id: string;
  status: string;
  message: string;
  timestamp: string;
  node_name: string;
  method: string;
  duration: number;
  started_at?: string;
}

interface TasksResponse {
  tasks: Task[];
}

interface TaskStatus {
  taskId: string;
  status: string;
  message: string;
}

export const IsolationControl = () => {
  const [selectedNode, setSelectedNode] = useState('');
  const [duration, setDuration] = useState(10);
  const [method, setMethod] = useState<IsolationMethod>('network');
  const [currentTask, setCurrentTask] = useState<TaskStatus | null>(null);
  const [showTaskStatus, setShowTaskStatus] = useState(false);

  const { data: nodes } = useQuery<NodeList>('nodes', nodeApi.getNodes);
  const { data: tasksData } = useQuery<TasksResponse>(
    'isolation-tasks',
    async () => {
      const response = await isolationApi.getAllTasks();
      return response as TasksResponse;
    },
    { refetchInterval: 5000 }
  );

  const startIsolationMutation = useMutation<
    IsolationResponse,
    Error,
    IsolationRequest
  >({
    mutationFn: (data: IsolationRequest) => isolationApi.startIsolation(data),
      onSuccess: (response: IsolationResponse) => {
        setCurrentTask({
        taskId: response.task_id,
          status: response.status,
        message: response.message
        });
        setShowTaskStatus(true);
      },
    onError: (error: any) => {
        console.error('격리 시작 오류:', error);
      console.error('오류 상세:', error.response?.data);
      alert(`격리 시작 중 오류가 발생했습니다: ${error.response?.data?.detail || error.message}`);
      }
  });

  const stopIsolationMutation = useMutation(
    (taskId: string) => isolationApi.stopIsolation(taskId),
    {
      onSuccess: () => {
        setCurrentTask(null);
        setShowTaskStatus(false);
      },
      onError: (error) => {
        console.error('격리 중지 오류:', error);
        alert('격리 중지 중 오류가 발생했습니다.');
      }
    }
  );

  const handleStartIsolation = () => {
    if (!selectedNode) {
      alert('노드를 선택해주세요.');
      return;
    }

    console.log('격리 시작 요청:', {
      node_name: selectedNode,
      duration: duration,
      method: method
    });

    startIsolationMutation.mutate({
      node_name: selectedNode,
      duration: duration,
      method: method as IsolationMethod
    }, {
      onSuccess: (response) => {
        console.log('격리 시작 성공:', response);
        setCurrentTask({
          taskId: response.task_id,
          status: response.status,
          message: response.message
        });
        setShowTaskStatus(true);
      },
      onError: (error: any) => {
        console.error('격리 시작 오류:', error);
        console.error('오류 상세:', error.response?.data);
        alert(`격리 시작 중 오류가 발생했습니다: ${error.response?.data?.detail || error.message}`);
      }
    });
  };

  const handleStopIsolation = async (taskId: string) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('현재 실행 중인 격리 작업을 중지하시겠습니까?')) {
      return;
    }

    stopIsolationMutation.mutate(taskId);
  };

  const isolationMethods = [
    { value: 'kubelet', label: 'Kubelet 중지', description: 'kubelet 서비스를 중지하여 노드 격리' },
    { value: 'network', label: '네트워크 차단', description: 'iptables로 API 서버 통신 차단' },
    { value: 'runtime', label: '런타임 중지', description: '컨테이너 런타임 중지' },
    { value: 'drain', label: '파드 드레인', description: '수동으로 파드 삭제' },
    { value: 'extreme', label: '극한 부하 테스트', description: '극한 리소스 고갈 시뮬레이션' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'stopping': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* 격리 시작 패널 */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">노드 격리 제어</h3>
        <p className="text-sm text-gray-600 mb-6">
          선택한 노드를 다양한 방법으로 격리하여 파드 마이그레이션을 테스트할 수 있습니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 노드 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              대상 노드
            </label>
            <select
              value={selectedNode}
              onChange={(e) => setSelectedNode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">노드를 선택하세요</option>
              {nodes?.nodes
                .filter((node: Node) => node.roles.includes('worker'))
                .map((node: Node) => (
                  <option key={node.name} value={node.name}>
                    {node.name} ({node.status})
                  </option>
                ))}
            </select>
          </div>

          {/* 격리 방법 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              격리 방법
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as IsolationMethod)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isolationMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          {/* 지속 시간 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              지속 시간 (초)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              min="60"
              max="3600"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 선택된 방법 설명 */}
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-blue-500 mt-0.5 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">
                {isolationMethods.find(m => m.value === method)?.label}
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                {isolationMethods.find(m => m.value === method)?.description}
              </p>
            </div>
          </div>
        </div>

        {/* 시작 버튼 */}
        <div className="mt-6">
          <button
            onClick={handleStartIsolation}
            disabled={!selectedNode || startIsolationMutation.isLoading}
            className="btn-primary flex items-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>격리 시작</span>
          </button>
        </div>
      </div>

      {/* 실행 중인 작업 목록 */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">격리 작업 현황</h3>
        
        {tasksData?.tasks && tasksData.tasks.length > 0 ? (
          <div className="space-y-4">
            {tasksData.tasks.map((task: Task) => (
              <div key={task.task_id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{task.node_name}</h4>
                      <p className="text-sm text-gray-600">{task.method} 방법</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{task.duration}초</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    
                    {(task.status === 'running' || task.status === 'idle') && (
                      <button
                        onClick={() => handleStopIsolation(task.task_id)}
                        disabled={stopIsolationMutation.isLoading}
                        className="btn-danger flex items-center space-x-1 text-xs px-3 py-1"
                      >
                        <Square className="w-3 h-3" />
                        <span>중지</span>
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="mt-2">
                  <p className="text-sm text-gray-600">{task.message}</p>
                  {task.started_at && (
                    <p className="text-xs text-gray-500 mt-1">
                      시작: {new Date(task.started_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            실행 중인 격리 작업이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};