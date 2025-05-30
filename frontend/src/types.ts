// 노드 관련 타입
export interface Node {
  name: string;
  status: string;
  roles: string[];
  version: string;
  internal_ip: string;
  os_image: string;
}

export interface NodeList {
  nodes: Node[];
}

// 격리 관련 타입
export type IsolationMethod = 'kubelet' | 'network' | 'runtime' | 'drain' | 'extreme';

export interface IsolationRequest {
  node_name: string;
  duration: number;
  method: IsolationMethod;
}

export interface IsolationResponse {
  task_id: string;
  status: string;
  message: string;
}

// 파드 분포 관련 타입
export interface PodDistribution {
  node_name: string;
  pod_count: number;
  ready_count: number;
  pods: Pod[];
}

export interface Pod {
  name: string;
  namespace: string;
  status: string;
  restarts: number;
}

export interface PodDistributionResponse {
  distributions: PodDistribution[];
}

// 모니터링 이벤트 관련 타입
export interface MonitoringEvent {
  id: string;
  type: string;
  reason: string;
  message: string;
  timestamp: string;
  source: {
    component: string;
    host?: string;
  };
  involved_object: {
    kind: string;
    name: string;
    namespace: string;
  };
} 