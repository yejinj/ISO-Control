// 격리 방법 타입 정의
// network: 네트워크 격리 (iptables로 API 서버 통신 차단)
// kubelet: kubelet 서비스 중지
// runtime: 컨테이너 런타임 중지
// drain: 노드 드레이닝 (파드 제거)
export type IsolationMethod = 'network' | 'kubelet' | 'runtime' | 'drain';

// 노드 정보 인터페이스
export interface Node {
  name: string;        // 노드 이름
  status: string;      // 노드 상태 (Ready, NotReady 등)
  roles: string[];     // 노드 역할 (master, worker 등)
  cpu: string;         // CPU 사용량
  memory: string;      // 메모리 사용량
  os_image: string;    // OS 이미지 정보
  version: string;     // 쿠버네티스 버전
  internal_ip: string; // 내부 IP 주소
}

// 노드 목록 인터페이스
export interface NodeList {
  nodes: Node[];       // 노드 배열
}

// 격리 요청 인터페이스
export interface IsolationRequest {
  node_name: string;   // 격리할 노드 이름
  duration: number;    // 격리 지속 시간(초)
  method: IsolationMethod;  // 격리 방법
}

// 격리 응답 인터페이스
export interface IsolationResponse {
  task_id: string;     // 격리 작업 ID
  status: string;      // 작업 상태
  message: string;     // 상태 메시지
}

// 모듈로 인식되도록 빈 export 추가
export {}; 