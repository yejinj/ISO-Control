// 통합 파드 데이터 타입
export interface IntegratedPodData {
  timestamp: string;
  pod_distribution: PodDistribution[];
  events: MonitoringEvent[];
  summary: {
    total_pods: number;
    running_pods: number;
    total_nodes: number;
    active_nodes: number;
  };
} 