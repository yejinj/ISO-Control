import React, { useEffect, useState } from 'react';
import { FiAlertTriangle, FiList } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { fetchPods, fetchEvents } from '../api';

const PROBE_COLORS: Record<string, string> = {
  Liveness: '#fbbf24',
  Readiness: '#ef4444',
  Startup: '#6b7280',
};
const PROBE_TEXT_COLORS: Record<string, string> = {
  Liveness: 'text-amber-500',
  Readiness: 'text-red-500',
  Startup: 'text-gray-500',
};

const Dashboard = () => {
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [probeFails, setProbeFails] = useState<any[]>([]);
  const [probeFailTypeCount, setProbeFailTypeCount] = useState<Record<string, number>>({ Liveness: 0, Readiness: 0, Startup: 0 });
  const [podStats, setPodStats] = useState<{ running: number; isolated: number }>({ running: 0, isolated: 0 });

  useEffect(() => {
    fetchEvents().then((data: any[]) => {
      setRecentEvents(
        data.slice(-5).reverse().map((ev: any, idx: number) => ({
        ...ev,
          id: ev.id || ev.start_time + ev.pod_name || idx,
        }))
      );
    });
    fetchPods().then((pods: any[]) => {
      // Pod 상태 기반 probe 실패 집계
      const fails: any[] = [];
      const typeCount: Record<string, number> = { Liveness: 0, Readiness: 0, Startup: 0 };
      pods.forEach(pod => {
        if (pod.liveness === false) {
          fails.push({ ...pod, probeType: 'Liveness' });
          typeCount.Liveness += 1;
        }
        if (pod.readiness === false) {
          fails.push({ ...pod, probeType: 'Readiness' });
          typeCount.Readiness += 1;
        }
        if (pod.startup === false) {
          fails.push({ ...pod, probeType: 'Startup' });
          typeCount.Startup += 1;
        }
      });
      setProbeFails(fails);
      setProbeFailTypeCount(typeCount);
      const running = pods.filter((p: any) => p.status === 'Running').length;
      const isolated = pods.filter((p: any) => p.status === 'Isolated').length;
      setPodStats({ running, isolated });
    });
  }, []);

  // probe 실패 그래프 데이터 (Pod 상태 기반)
  const probeFailGraphData = Object.entries(probeFailTypeCount)
    .filter(([type, value]) => (type === 'Liveness' || type === 'Readiness' || type === 'Startup') && value > 0)
    .map(([type, value]) => ({ name: type, value, color: PROBE_COLORS[type] }));

  return (
    <div className="space-y-6 mt-6">
      {/* 1행 2열: 현재 pod 상태, 최근 24시간 probe 실패 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
            <FiAlertTriangle className="text-base text-amber-400 mr-2" />
            <h2 className="text-sm font-semibold text-gray-700">최근 24시간 Probe 실패</h2>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center mt-2 w-full">
            <ResponsiveContainer width="80%" height={100}>
              <PieChart>
                <Pie
                  data={probeFailGraphData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={40}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {probeFailGraphData.map((entry, index) => (
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
          {/* probe 실패 종류별 카운트 리스트 */}
          <ul className="text-xs space-y-0.5 mt-3 text-center">
            {probeFailGraphData.length === 0 && (
              <li>최근 24시간 내 Probe 실패가 없습니다.</li>
            )}
            {probeFailGraphData.map(({ name, value }) => (
              <li key={name} className={PROBE_TEXT_COLORS[name] + ' font-semibold'}>{name}: {value}회</li>
            ))}
          </ul>
        </div>
      </div>
      {/* 2행 1열: 최근 이벤트 표 (메시지 포함) */}
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <FiList className="text-base text-purple-400 mr-2" />
              <h2 className="text-sm font-semibold text-gray-700">최근 이벤트</h2>
            </div>
          </div>
        {/* 최근 이벤트 표 */}
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-xs border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-1 text-left font-medium text-gray-500">이벤트 종류</th>
                <th className="px-2 py-1 text-left font-medium text-gray-500">Pod 이름</th>
                <th className="px-2 py-1 text-left font-medium text-gray-500">메시지</th>
                <th className="px-2 py-1 text-left font-medium text-gray-500">시간</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
            {recentEvents.length === 0 && (
                <tr><td colSpan={4} className="text-center py-4 text-gray-400">최근 이벤트가 없습니다.</td></tr>
              )}
              {recentEvents.map((event, idx) => (
                <tr key={event.id || idx} className="odd:bg-white even:bg-gray-50">
                  <td className="px-2 py-1">
                    <span className={`inline-block px-1 py-0.5 rounded text-white text-[10px] ${
                      event.type === 'alert' ? 'bg-red-500' :
                      event.type === 'ProbeFail' ? 'bg-yellow-400 text-gray-800' :
                      'bg-gray-400'
                    }`}>
                      {event.type}
                    </span>
                  </td>
                  <td className="px-2 py-1 text-gray-700">{event.pod_name}</td>
                  <td className="px-2 py-1 text-gray-500">{event.message || '-'}</td>
                  <td className="px-2 py-1 text-gray-500">
                    {event.start_time
                      ? new Date(event.start_time).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;