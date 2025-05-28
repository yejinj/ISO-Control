import axios from 'axios';
import {
  NodeListResponse,
  PodDistributionResponse,
  IsolationRequest,
  IsolationResponse,
  MonitoringResponse,
  SuccessResponse
} from '../types/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 30000,
});

// 노드 관련 API
export const nodeApi = {
  getNodes: (): Promise<NodeListResponse> =>
    api.get('/nodes').then(res => res.data),
  
  getNode: (nodeName: string) =>
    api.get(`/nodes/${nodeName}`).then(res => res.data),
  
  cordonNode: (nodeName: string): Promise<SuccessResponse> =>
    api.post(`/nodes/${nodeName}/cordon`).then(res => res.data),
  
  uncordonNode: (nodeName: string): Promise<SuccessResponse> =>
    api.post(`/nodes/${nodeName}/uncordon`).then(res => res.data),
  
  drainNode: (nodeName: string): Promise<SuccessResponse> =>
    api.post(`/nodes/${nodeName}/drain`).then(res => res.data),
};

// 파드 관련 API
export const podApi = {
  getPods: (namespace?: string) =>
    api.get('/pods', { params: { namespace } }).then(res => res.data),
  
  getPodDistribution: (): Promise<PodDistributionResponse> =>
    api.get('/pods/distribution').then(res => res.data),
};

// 격리 관련 API
export const isolationApi = {
  startIsolation: (request: IsolationRequest): Promise<IsolationResponse> =>
    api.post('/isolation/start', request).then(res => res.data),
  
  getIsolationStatus: (taskId: string): Promise<IsolationResponse> =>
    api.get(`/isolation/status/${taskId}`).then(res => res.data),
  
  stopIsolation: (taskId: string): Promise<SuccessResponse> =>
    api.post('/isolation/stop', { task_id: taskId }).then(res => res.data),
  
  getAllTasks: () =>
    api.get('/isolation/tasks').then(res => res.data),
};

// 모니터링 관련 API
export const monitoringApi = {
  getClusterStatus: () =>
    api.get('/monitoring/cluster').then(res => res.data),
  
  getMonitoringEvents: (limit = 50) =>
    api.get('/monitoring/events', { params: { limit } }).then(res => res.data),
  
  getMonitoringData: (): Promise<MonitoringResponse> =>
    api.get('/monitoring').then(res => res.data),
};

export default api; 