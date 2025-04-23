import React from 'react';
import { FiAlertTriangle, FiCheckCircle, FiClock, FiList, FiCpu } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Probe 실패 데이터 (Readiness 색상 red-500으로 변경)
const probeFailData = [
  { name: 'Liveness', value: 2, color: '#fbbf24' }, // amber-400
  { name: 'Readiness', value: 5, color: '#ef4444' }, // red-500
  { name: 'Startup', value: 0, color: '#d1d5db' },    // gray-300
];

// 최근 이벤트 데이터 (ProbeFail 색상 bg-red-500으로 변경)
const recentEvents = [
  { id: 1, type: 'ProbeFail', name: 'core-xyz-123', time: '10분 전', colorClass: 'bg-red-500' }, // red-500
  { id: 2, type: 'Isolated', name: 'worker-abc-456', time: '15분 전', colorClass: 'bg-yellow-400' },
  { id: 3, type: 'Recovered', name: 'db-main-789', time: '30분 전', colorClass: 'bg-green-400' },
];

const Dashboard = () => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-700">현재 Pod 상태</h2>
          </div>
          <div className="flex items-end justify-around text-center">
            <div>
              <p className="text-3xl font-bold text-green-500">3</p>
              <p className="text-xs text-gray-500 mt-1">실행 중</p>
            </div>
            <div className="border-l border-gray-200 h-10 mx-4"></div>
            <div>
              <p className="text-3xl font-bold text-red-500">1</p>
              <p className="text-xs text-gray-500 mt-1">격리됨</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">
          <div className="flex items-center mb-3">
            <FiAlertTriangle className="text-base text-amber-400 mr-2" />
            <h2 className="text-sm font-semibold text-gray-700">최근 24시간 Probe 실패</h2>
          </div>
          <div className="flex-1 flex items-center justify-center mt-2">
            <ResponsiveContainer width="80%" height={100}>
              <PieChart>
                <Pie
                  data={probeFailData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={40}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {probeFailData.filter(d => d.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ fontSize: '10px', padding: '2px 5px' }}
                  itemStyle={{ padding: 0 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="text-xs text-gray-500 space-y-0.5 mt-3 text-center">
              <li>Liveness: <span className="font-semibold text-amber-500">{probeFailData[0].value}</span>회</li>
              <li>Readiness: <span className="font-semibold text-red-500">{probeFailData[1].value}</span>회</li>
              <li>Startup: <span className="font-semibold text-gray-500">{probeFailData[2].value}</span>회</li>
          </ul>
        </div>
        
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <FiList className="text-base text-purple-400 mr-2" />
              <h2 className="text-sm font-semibold text-gray-700">최근 이벤트</h2>
            </div>
            <a href="/event-log" className="text-xs text-blue-500 hover:underline">더보기</a>
          </div>
          <div className="flex-grow space-y-2 overflow-y-auto max-h-28 pr-1">
            {recentEvents.map((event) => {
              return (
                <div key={event.id} className="flex items-center text-xs text-gray-600">
                  <span className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${event.colorClass}`}></span>
                  <span className="flex-grow truncate" title={`${event.type}: ${event.name}`}>{event.name}</span>
                  <span className="ml-2 text-gray-400 flex-shrink-0">{event.time}</span>
                </div>
              );
            })}
            {recentEvents.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">최근 이벤트가 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;