// 실제 API 호출 로직

import axios from 'axios';
import type { 
  IsolationMethod, 
  IsolationResponse, 
  NodeList, 
  PodDistribution,
  PodDistributionResponse,
  MonitoringEvent,
  IntegratedPodData
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 30000,
});

// 노드 관련 API
export const nodeApi = {
  getNodes: async (): Promise<NodeList> => {
    const response = await api.get<NodeList>('/nodes');
    return response.data;
  },
  
  getNode: async (nodeName: string) => {
    const response = await api.get(`/nodes/${nodeName}`);
    return response.data;
  },
  
  cordonNode: async (nodeName: string) => {
    const response = await api.post(`/nodes/${nodeName}/cordon`);
    return response.data;
  },
  
  uncordonNode: async (nodeName: string) => {
    const response = await api.post(`/nodes/${nodeName}/uncordon`);
    return response.data;
  },
  
  drainNode: async (nodeName: string) => {
    const response = await api.post(`/nodes/${nodeName}/drain`);
    return response.data;
  },
};

// 파드 관련 API
export const podApi = {
  getPods: async (namespace?: string) => {
    const response = await api.get('/pods', { params: { namespace } });
    return response.data;
  },
  
  getPodDistribution: async (): Promise<PodDistribution[]> => {
    const response = await api.get<PodDistributionResponse>('/pods/distribution');
    return response.data.distributions;
  },

  getIntegratedPodData: async (): Promise<IntegratedPodData> => {
    const response = await api.get<IntegratedPodData>('/pods/integrated');
    return response.data;
  },
};

// 격리 관련 API
export const isolationApi = {
  startIsolation: async (data: {
    node_name: string;
    duration: number;
    method: IsolationMethod;
  }): Promise<IsolationResponse> => {
    const response = await api.post<IsolationResponse>('/isolation/start', data);
    return response.data;
  },
  
  getIsolationStatus: async (taskId: string) => {
    const response = await api.get(`/isolation/status/${taskId}`);
    return response.data;
  },
  
  stopIsolation: async (taskId: string) => {
    const response = await api.post('/isolation/stop', { task_id: taskId });
    return response.data;
  },
  
  getAllTasks: async () => {
    const response = await api.get('/isolation/tasks');
    return response.data;
  },
};

// 모니터링 관련 API
export const monitoringApi = {
  getClusterStatus: async () => {
    // 클러스터 전체 상태 조회
    const response = await api.get('/monitoring/cluster');
    return response.data;
  },
  
  getMonitoringEvents: async (limit = 50) => {
    // 최근 이벤트 조회
    const response = await api.get('/monitoring/events', { params: { limit } });
    return response.data;
  },
  
  getMonitoringData: async () => {
    // 통합 조회
    try {
      const [clusterResponse, eventsResponse] = await Promise.all([
        api.get('/monitoring/cluster'),
        api.get('/monitoring/events', { params: { limit: 50 } })
      ]);
      
      return {
        cluster_status: clusterResponse.data,
        recent_events: (eventsResponse.data as { events: MonitoringEvent[] }).events || []
      };
    } catch (error) {
      console.error('모니터링 데이터 조회 실패:', error);
      return {
        cluster_status: {
          timestamp: new Date().toISOString(),
          nodes: [],
          pod_distribution: [],
          total_nodes: 0,
          ready_nodes: 0,
          total_pods: 0,
          running_pods: 0
        },
        recent_events: []
      };
    }
  },
};

export { api as default };
export {};