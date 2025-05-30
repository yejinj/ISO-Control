export type IsolationMethod = 'network' | 'kubelet' | 'runtime' | 'drain';

export interface Node {
  name: string;
  status: string;
  roles: string[];
  cpu: string;
  memory: string;
  os_image: string;
  version: string;
  internal_ip: string;
}

export interface NodeList {
  nodes: Node[];
}

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