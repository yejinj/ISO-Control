import React, { useEffect, useState } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiClock, FiList, FiCpu } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { fetchProbes, fetchPods, fetchEvents } from '../api';

interface ProbeFailData {
  name: string;
  value: number;
  color: string;
}

interface EventItem {
  id: number;
  type: string;
  name: string;
  time: string;
  colorClass: string;
}

const Dashboard = () => {
  const [probeFailData, setProbeFailData] = useState<ProbeFailData[]>([
    { name: 'Liveness', value: 0, color: '#fbbf24' },
    { name: 'Readiness', value: 0, color: '#ef4444' },
    { name: 'Startup', value: 0, color: '#d1d5db' },
  ]);
  const [recentEvents, setRecentEvents] = useState<EventItem[]>([]);
  const [podStats, setPodStats] = useState<{ running: number; isolated: number }>({ running: 0, isolated: 0 });

  useEffect(() => {
    fetchProbes().then(data => {
      setProbeFailData([
        { name: 'Liveness', value: data.liveness.fail_count, color: '#fbbf24' },
        { name: 'Readiness', value: data.readiness.fail_count, color: '#ef4444' },
        { name: 'Startup', value: data.startup.fail_count, color: '#d1d5db' },
      ]);
    });
    fetchEvents().then((data: any[]) => {
      setRecentEvents(data.map((ev: any) => ({
        ...ev,
        colorClass:
          ev.type === 'ProbeFail' ? 'bg-red-500' :
          ev.type === 'Isolated' ? 'bg-yellow-400' :
          ev.type === 'Recovered' ? 'bg-green-400' : 'bg-gray-300',
      })));
    });
    fetchPods().then((data: any[]) => {
      const running = data.filter((p: any) => p.status === 'Running').length;
      const isolated = data.filter((p: any) => p.status === 'Isolated').length;
      setPodStats({ running, isolated });
    });
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-700">현재 Pod 상태</h2>
          </div>
          <div className="flex items-end justify-around text-center">
            <div>
              <p className="text-3xl font-bold text-green-500">{podStats.running}</p>
              <p className="text-xs text-gray-500 mt-1">실행 중</p>
            </div>
            <div className="border-l border-gray-200 h-10 mx-4"></div>
            <div>
              <p className="text-3xl font-bold text-red-500">{podStats.isolated}</p>
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