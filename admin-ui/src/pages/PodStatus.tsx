import React, { useEffect, useState } from 'react';
import { FiHardDrive, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { fetchPods } from '../api';

interface Pod {
  name: string;
  liveness: boolean;
  readiness: boolean;
  startup: boolean;
  status: string;
}

// Probe 상태 아이콘 컴포넌트 (타입 추가)
const ProbeStatusIcon: React.FC<{ status: boolean | null | undefined }> = ({ status }) => {
  if (status === true) {
    return <FiCheckCircle className="text-green-500 mx-auto" size={14} />;
  } else if (status === false) {
    return <FiXCircle className="text-red-500 mx-auto" size={14} />;
  } else {
    return <FiAlertCircle className="text-gray-400 mx-auto" size={14} />;
  }
};

// Pod 상태 배지 컴포넌트 (타입 추가)
const PodStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let colorClasses = 'bg-gray-100 text-gray-700';
  if (status === 'Running') {
    colorClasses = 'bg-green-100 text-green-700';
  } else if (status === 'Isolated') {
    colorClasses = 'bg-red-100 text-red-700';
  } else if (status === 'Pending') {
    colorClasses = 'bg-yellow-100 text-yellow-700';
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colorClasses}`}>
      {status}
    </span>
  );
};

const PodStatus = () => {
  const [pods, setPods] = useState<Pod[]>([]);

  useEffect(() => {
    fetchPods().then((data: Pod[]) => setPods(data));
  }, []);

  return (
    <div className="space-y-5"> 
      {/* 페이지 헤더 (폰트/아이콘 크기 조정) */}
      <div className="pb-2 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-800 flex items-center">
          <FiHardDrive className="mr-2 text-blue-400" size={18} />
          Pod 상태 모니터링
        </h1>
      </div>
      {/* Pod 상태 테이블 (폰트 크기 조정) */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-xs"> 
          <thead className="bg-gray-50"> 
            <tr>
              <th className="px-3 py-1.5 text-left font-medium text-gray-500">Pod 이름</th>
              <th className="px-3 py-1.5 text-center font-medium text-gray-500">Liveness</th>
              <th className="px-3 py-1.5 text-center font-medium text-gray-500">Readiness</th>
              <th className="px-3 py-1.5 text-center font-medium text-gray-500">Startup</th>
              <th className="px-3 py-1.5 text-center font-medium text-gray-500">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200"> 
            {pods.map((pod, index) => (
              <tr key={index} className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition-colors"> 
                <td className="px-3 py-1.5 text-gray-700">{pod.name}</td>
                <td className="px-3 py-1.5 text-center"><ProbeStatusIcon status={pod.liveness} /></td>
                <td className="px-3 py-1.5 text-center"><ProbeStatusIcon status={pod.readiness} /></td>
                <td className="px-3 py-1.5 text-center"><ProbeStatusIcon status={pod.startup} /></td>
                <td className="px-3 py-1.5 text-center">
                  <PodStatusBadge status={pod.status} />
                </td>
              </tr>
            ))}
             {pods.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">Pod 상태 정보가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PodStatus;