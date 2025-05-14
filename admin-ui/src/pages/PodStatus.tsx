import React, { useEffect, useState } from 'react';
import { FiHardDrive, FiCheckCircle, FiXCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { fetchPods } from '../api';

interface ContainerState {
  name: string;
  restartCount: number;
  lastRestart: string | null;
  state: string | null;
}

interface Pod {
  name: string;
  liveness: boolean | null | undefined;
  readiness: boolean | null | undefined;
  startup: boolean | null | undefined;
  status: string;
  restartCount?: number;
  lastRestart?: string | null;
  containerStates?: ContainerState[];
}

// Pod 이름 마스킹 함수 (고유 식별자 부분만 *)
function maskPodName(name: string) {
  const lastDash = name.lastIndexOf('-');
  if (lastDash > 3) {
    const prefix = name.slice(0, 3);
    const masked = '*'.repeat(lastDash - 3);
    const suffix = name.slice(lastDash);
    return prefix + masked + suffix;
  }
  if (name.length > 2) {
    return name.slice(0, 1) + '*'.repeat(name.length - 2) + name.slice(-1);
  }
  return name;
}

const ProbeStatusIcon: React.FC<{ status: boolean | null | undefined }> = ({ status }) => {
  if (status === true) return <FiCheckCircle className="text-green-500 mx-auto" size={14} />;
  if (status === false) return <FiXCircle className="text-red-500 mx-auto" size={14} />;
  return <FiAlertCircle className="text-gray-400 mx-auto" size={14} />;
};

const PodStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let colorClasses = 'bg-gray-100 text-gray-700';
  if (status === 'Running') colorClasses = 'bg-green-100 text-green-700';
  else if (status === 'Isolated') colorClasses = 'bg-red-100 text-red-700';
  else if (status === 'Pending') colorClasses = 'bg-yellow-100 text-yellow-700';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colorClasses}`}>
      {status}
    </span>
  );
};

const SORT_OPTIONS = [
  { value: 'probe', label: 'Probe 실패/미시도 우선순' },
  { value: 'pending', label: 'Pending 우선순' },
  { value: 'name', label: '이름순' },
  { value: 'status', label: '상태순' },
];

const STATUS_ORDER: Record<string, number> = {
  Running: 0,
  Pending: 1,
  Isolated: 2,
};

const PodStatus = () => {
  const [pods, setPods] = useState<Pod[]>([]);
  const [sortKey, setSortKey] = useState<string>('probe');

  useEffect(() => {
    fetchPods().then((data: Pod[]) => setPods(data));
  }, []);

  const sortedPods = [...pods].sort((a, b) => {
    if (sortKey === 'probe') {
      const aProbeFail = [a.liveness, a.readiness, a.startup].some(v => v !== true);
      const bProbeFail = [b.liveness, b.readiness, b.startup].some(v => v !== true);
      if (aProbeFail !== bProbeFail) return aProbeFail ? -1 : 1;
      return a.name.localeCompare(b.name);
    }
    if (sortKey === 'pending') {
      if (a.status === 'Pending' && b.status !== 'Pending') return -1;
      if (a.status !== 'Pending' && b.status === 'Pending') return 1;
      return a.name.localeCompare(b.name);
    }
    if (sortKey === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortKey === 'status') {
      // Running < Pending < Isolated < 기타
      const aOrder = STATUS_ORDER[a.status] ?? 99;
      const bOrder = STATUS_ORDER[b.status] ?? 99;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-800 flex items-center">
          <FiHardDrive className="mr-2 text-blue-400" size={18} />
          Pod 상태 모니터링
        </h1>
        <div>
          <select
            className="text-xs border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none bg-white shadow-sm"
            value={sortKey}
            onChange={e => setSortKey(e.target.value)}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-1.5 text-left font-medium text-gray-500">Pod 이름</th>
              <th className="px-3 py-1.5 text-center font-medium text-gray-500">Liveness</th>
              <th className="px-3 py-1.5 text-center font-medium text-gray-500">Readiness</th>
              <th className="px-3 py-1.5 text-center font-medium text-gray-500">Startup</th>
              <th className="px-3 py-1.5 text-center font-medium text-gray-500">상태</th>
              <th className="px-3 py-1.5 text-center font-medium text-gray-500">재시작</th>
              <th className="px-3 py-1.5 text-center font-medium text-gray-500">마지막 재시작</th>
              <th className="px-3 py-1.5 text-center font-medium text-gray-500">컨테이너</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedPods.map((pod, index) => (
              <tr key={index} className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition-colors">
                <td className="px-3 py-1.5 text-gray-700">{maskPodName(pod.name)}</td>
                <td className="px-3 py-1.5 text-center"><ProbeStatusIcon status={pod.liveness} /></td>
                <td className="px-3 py-1.5 text-center"><ProbeStatusIcon status={pod.readiness} /></td>
                <td className="px-3 py-1.5 text-center"><ProbeStatusIcon status={pod.startup} /></td>
                <td className="px-3 py-1.5 text-center">
                  <PodStatusBadge status={pod.status} />
                </td>
                <td className={`px-3 py-1.5 text-center font-bold ${pod.restartCount && pod.restartCount > 0 ? 'text-red-500' : 'text-gray-700'}`}>{pod.restartCount ?? '-'}</td>
                <td className="px-3 py-1.5 text-center text-gray-500">{pod.lastRestart ? new Date(pod.lastRestart).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) : '-'}</td>
                <td className="px-3 py-1.5 text-center">
                  {pod.containerStates && pod.containerStates.length > 0 ? (
                    <div className="flex flex-col items-center gap-1">
                      {pod.containerStates.map(cs => (
                        <span key={cs.name} className="group relative cursor-pointer">
                          <FiInfo className="inline mr-1 text-blue-400" size={13} />
                          <span className="underline text-xs text-gray-700">{cs.name}</span>
                          <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg p-2 text-xs text-gray-700 z-20 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
                            상태: {cs.state || '-'}<br />
                            재시작: {cs.restartCount}<br />
                            마지막 재시작: {cs.lastRestart ? new Date(cs.lastRestart).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) : '-'}
                          </div>
                        </span>
                      ))}
                    </div>
                  ) : '-'}
                </td>
              </tr>
            ))}
            {sortedPods.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-400">Pod 상태 정보가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PodStatus;