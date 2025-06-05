// 타입 정의만 포함

// 노드 관련 타입
export interface NodeInfo {
  name: string;
  status: 'Ready' | 'NotReady' | 'Unknown';
  roles: string[];
  age: string;
  version: string;
  internal_ip: string;
  external_ip?: string;
  os_image: string;
  kernel_version: string;
  container_runtime: string;
}

export interface NodeListResponse {
  nodes: NodeInfo[];
  total_count: number;
}

// 파드 관련 타입
export interface PodInfo {
  name: string;
  namespace: string;
  status: 'Running' | 'Pending' | 'Succeeded' | 'Failed' | 'Unknown' | 'Terminating';
  ready: string;
  restarts: number;
  age: string;
  ip?: string;
  node: string;
  nominated_node?: string;
  readiness_gates?: string;
}

export interface PodDistribution {
  node_name: string;
  pod_count: number;
  ready_count: number;
  pods: PodInfo[];
}

export interface PodDistributionResponse {
  distributions: PodDistribution[];
  total_pods: number;
}

export interface NodePodDistribution {
  nodeName: string;
  totalPods: number;
  runningPods: number;
  pendingPods: number;
  failedPods: number;
  pods: PodInfo[];
}

// 격리 관련 타입
export type IsolationMethod = 'network' | 'kubelet' | 'runtime' | 'drain' | 'extreme';
export type IsolationStatus = 'idle' | 'running' | 'stopping' | 'completed' | 'failed';

export interface IsolationRequest {
  node_name: string;
  method: IsolationMethod;
  duration: number;
}

export interface IsolationResponse {
  task_id: string;
  node_name: string;
  method: IsolationMethod;
  status: IsolationStatus;
  duration: number;
  started_at?: string;
  completed_at?: string;
  message: string;
}

// 모니터링 관련 타입
export interface ClusterStatus {
  timestamp: string;
  nodes: NodeInfo[];
  pod_distribution: PodDistribution[];
  total_nodes: number;
  ready_nodes: number;
  total_pods: number;
  running_pods: number;
}

export interface MonitoringEvent {
  id: string;
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  node?: string;
  pod?: string;
}

export interface MonitoringResponse {
  cluster_status: ClusterStatus;
  recent_events: MonitoringEvent[];
}

// 공통 응답 타입
export interface SuccessResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface ErrorResponse {
  success: boolean;
  error: string;
  details?: string;
} 