import React, { useEffect, useState } from 'react';
import { FiAlertTriangle, FiList } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { fetchProbes, fetchPods, fetchEvents } from '../api';

interface ProbeFail {
  pod_name: string;
  type: string;
  start_time: string;
  message?: string;
}

const Dashboard = () => {
  const [probeFailData, setProbeFailData] = useState([
    { name: 'Liveness', value: 0, color: '#fbbf24' },
    { name: 'Readiness', value: 0, color: '#ef4444' },
    { name: 'Startup', value: 0, color: '#d1d5db' },
  ]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [probeFails, setProbeFails] = useState<ProbeFail[]>([]);
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
      // 최근 이벤트 (최신순 5개)
      setRecentEvents(
        data.slice(-5).reverse().map((ev: any, idx: number) => ({
          ...ev,
          id: ev.id || ev.start_time + ev.pod_name || idx,
        }))
      );
      // 최근 24시간 probe 실패만 필터링
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      setProbeFails(
        data.filter(ev =>
          ev.type === 'ProbeFail' &&
          new Date(ev.start_time) > dayAgo
        )
      );
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
          <div className="flex-1 flex flex-col items-center justify-center mt-2 w-full">
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
            {/* 표로 자세히 보기 */}
            <div className="w-full mt-4 overflow-x-auto">
              <table className="w-full text-xs border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-left font-medium text-gray-500">시간</th>
                    <th className="px-2 py-1 text-left font-medium text-gray-500">Pod 이름</th>
                    <th className="px-2 py-1 text-left font-medium text-gray-500">Probe 종류</th>
                    <th className="px-2 py-1 text-left font-medium text-gray-500">메시지</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {probeFails.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-4 text-gray-400">최근 24시간 내 Probe 실패가 없습니다.</td></tr>
                  )}
                  {probeFails.map((fail, idx) => (
                    <tr key={idx} className="odd:bg-white even:bg-gray-50">
                      <td className="px-2 py-1 whitespace-nowrap text-gray-700">{fail.start_time}</td>
                      <td className="px-2 py-1 text-gray-700">{fail.pod_name}</td>
                      <td className="px-2 py-1 text-gray-700">{fail.type}</td>
                      <td className="px-2 py-1 text-gray-500">{fail.message || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
            {recentEvents.map((event, idx) => (
              <div key={event.id || idx} className="flex items-center text-xs text-gray-600">
                <span className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 bg-gray-300`}></span>
                <span className="flex-grow truncate" title={`${event.type}: ${event.pod_name}`}>{event.pod_name}</span>
                <span className="ml-2 text-gray-400 flex-shrink-0">{event.start_time}</span>
              </div>
            ))}
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