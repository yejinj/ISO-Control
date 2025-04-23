import React from 'react';
import { FiList, FiFilter, FiSearch } from 'react-icons/fi'; // 필터 관련 아이콘 추가

// 임시 이벤트 로그 데이터
const logs = [
  {
    time: '04/23 14:20', 
    podName: 'core-xyz-123', 
    probeType: 'Liveness', 
    reason: '/healthz timeout after 5s', 
    isolated: true, 
    recovered: true
  },
  {
    time: '04/23 10:05', 
    podName: 'worker-abc-456', 
    probeType: 'Readiness', 
    reason: 'Connection refused on port 8080', 
    isolated: true, 
    recovered: false
  },
  {
    time: '04/22 18:30',
    podName: 'api-gateway-prod',
    probeType: 'Liveness',
    reason: 'Pod unhealthy',
    isolated: true,
    recovered: true
  },
  {
    time: '04/22 09:15',
    podName: 'frontend-ui-dev',
    probeType: 'Readiness',
    reason: 'Service unavailable (503)',
    isolated: false,
    recovered: true
  },
  // 추가 로그 데이터...
];

// 상태 배지 스타일 함수
const StatusBadge = ({ active, text, color }) => {
  if (!active) return <span className="text-gray-400">-</span>;
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-700`}>
      {text}
    </span>
  );
};

const EventLog = () => {
  return (
    <div className="space-y-5"> {/* 간격 조정 */}
      {/* 페이지 헤더 (폰트/아이콘 크기 조정) */}
      <div className="pb-2 border-b border-gray-200"> {/* 패딩 조정 */}
        <h1 className="text-lg font-semibold text-gray-800 flex items-center"> {/* text-xl -> text-lg */}
          <FiList className="mr-2 text-purple-400" size={18} /> {/* size 20 -> 18 */}
          장애 이력
        </h1>
      </div>

      {/* 필터/검색 영역 (폰트/아이콘 크기, 패딩 조정) */}
      <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex items-center space-x-3"> {/* 패딩/간격 조정 */}
        <FiFilter className="text-gray-400" size={14}/> {/* 아이콘 크기 조정 */}
        <select className="text-xs border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none"> {/* 폰트 크기, 패딩, 테두리 조정 */}
          <option>모든 시간</option>
          <option>최근 1시간</option>
          <option>최근 24시간</option>
        </select>
        <div className="relative flex-grow">
          <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} /> {/* 아이콘 크기 조정 */}
          <input 
            type="text" 
            placeholder="Pod 이름 검색..." 
            className="text-xs border border-gray-200 rounded w-full px-2 py-1 pl-6 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none" // 폰트 크기, 패딩, 테두리 조정
          />
        </div>
      </div>

      {/* 이벤트 로그 테이블 (폰트 크기 조정) */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-xs"> {/* text-sm -> text-xs */}
          <thead className="bg-gray-50">
            <tr>
              {/* 헤더 폰트 크기/패딩 조정 */}
              <th className="px-3 py-1.5 text-left font-medium text-gray-500">시간</th>
              <th className="px-3 py-1.5 text-left font-medium text-gray-500">Pod 이름</th>
              <th className="px-3 py-1.5 text-left font-medium text-gray-500">Probe 종류</th>
              <th className="px-3 py-1.5 text-left font-medium text-gray-500">실패 원인</th>
              <th className="px-3 py-1.5 text-center font-medium text-gray-500">격리</th>
              <th className="px-3 py-1.5 text-center font-medium text-gray-500">복구</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map((log, index) => (
              <tr key={index} className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition-colors"> 
                {/* 셀 패딩 조정 */}
                <td className="px-3 py-1.5 whitespace-nowrap text-gray-700">{log.time}</td>
                <td className="px-3 py-1.5 text-gray-700">{log.podName}</td>
                <td className="px-3 py-1.5 text-gray-700">{log.probeType}</td>
                <td className="px-3 py-1.5 text-gray-600">{log.reason}</td>
                <td className="px-3 py-1.5 text-center">
                   <StatusBadge active={log.isolated} text="격리됨" color="red" />
                </td>
                <td className="px-3 py-1.5 text-center">
                   <StatusBadge active={log.recovered} text="복구됨" color="green" />
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">이벤트 로그가 없습니다.</td> {/* 패딩 조정 */}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventLog;